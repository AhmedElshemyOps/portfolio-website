-- Supabase Postgres migration. Run once in a new project; no paid service required.
-- Browser clients use publishable/anon keys only. Never expose the service-role key.
begin;
create table public.iq_workspaces (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 120),
 settings jsonb not null default '{}', owner_id uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.iq_members (
 workspace_id uuid not null references public.iq_workspaces(id), user_id uuid not null references auth.users(id),
 role text not null check(role in ('admin','sales','operations')), primary key(workspace_id,user_id)
);
create table public.iq_rates (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.iq_workspaces(id),
 name text not null, supplier text not null default '', unit_cost numeric not null check(unit_cost>=0), quantity numeric not null check(quantity>0),
 currency text not null default 'AED' check(currency in ('AED','EUR')), valid_from date not null, valid_to date not null check(valid_to>=valid_from),
 verified boolean not null default false, terms text not null default '', created_at timestamptz not null default now()
);
create table public.iq_templates (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.iq_workspaces(id),
 name text not null, setup jsonb not null check(jsonb_typeof(setup)='object'), created_at timestamptz not null default now()
);
create table public.iq_versions (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.iq_workspaces(id), reference text not null,
 version integer not null check(version>0), snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
 approved boolean not null default false, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 unique(workspace_id,reference,version)
);
create table public.iq_handovers (
 version_id uuid primary key references public.iq_versions(id), workspace_id uuid not null references public.iq_workspaces(id),
 service jsonb not null, created_at timestamptz not null default now()
);
create table public.iq_audit (
 id bigint generated always as identity primary key, workspace_id uuid not null references public.iq_workspaces(id),
 actor uuid not null references auth.users(id), action text not null, item_id uuid, created_at timestamptz not null default now()
);
create index on public.iq_members(user_id);
create index on public.iq_versions(workspace_id,created_at desc);
create index on public.iq_rates(workspace_id);
create index on public.iq_templates(workspace_id);
create index on public.iq_audit(workspace_id);
create function public.iq_role(target uuid) returns text language sql stable security definer set search_path='' as $$
 select role from public.iq_members where workspace_id=target and user_id=auth.uid();
$$;
alter table public.iq_workspaces enable row level security;
alter table public.iq_members enable row level security;
alter table public.iq_rates enable row level security;
alter table public.iq_templates enable row level security;
alter table public.iq_versions enable row level security;
alter table public.iq_handovers enable row level security;
alter table public.iq_audit enable row level security;
revoke all on public.iq_workspaces,public.iq_members,public.iq_rates,public.iq_templates,public.iq_versions,public.iq_handovers,public.iq_audit from anon,authenticated;
grant select on public.iq_workspaces,public.iq_members,public.iq_versions,public.iq_handovers,public.iq_audit to authenticated;
grant select,insert,update,delete on public.iq_rates,public.iq_templates to authenticated;
grant update(name,settings) on public.iq_workspaces to authenticated;
create policy workspace_read on public.iq_workspaces for select to authenticated using(public.iq_role(id) is not null);
create policy workspace_update on public.iq_workspaces for update to authenticated using(public.iq_role(id)='admin') with check(public.iq_role(id)='admin');
create policy member_read on public.iq_members for select to authenticated using(public.iq_role(workspace_id) is not null);
create policy rates_read on public.iq_rates for select to authenticated using(public.iq_role(workspace_id) in ('admin','sales'));
create policy rates_insert on public.iq_rates for insert to authenticated with check(public.iq_role(workspace_id) in ('admin','sales'));
create policy rates_update on public.iq_rates for update to authenticated using(public.iq_role(workspace_id) in ('admin','sales')) with check(public.iq_role(workspace_id) in ('admin','sales'));
create policy rates_delete on public.iq_rates for delete to authenticated using(public.iq_role(workspace_id) in ('admin','sales'));
create policy templates_read on public.iq_templates for select to authenticated using(public.iq_role(workspace_id) in ('admin','sales'));
create policy templates_insert on public.iq_templates for insert to authenticated with check(public.iq_role(workspace_id) in ('admin','sales'));
create policy templates_update on public.iq_templates for update to authenticated using(public.iq_role(workspace_id) in ('admin','sales')) with check(public.iq_role(workspace_id) in ('admin','sales'));
create policy templates_delete on public.iq_templates for delete to authenticated using(public.iq_role(workspace_id) in ('admin','sales'));
create policy versions_read on public.iq_versions for select to authenticated using(public.iq_role(workspace_id) in ('admin','sales'));
create policy handovers_read on public.iq_handovers for select to authenticated using(public.iq_role(workspace_id) is not null);
create policy audit_read on public.iq_audit for select to authenticated using(public.iq_role(workspace_id)='admin');
create function public.iq_create_workspace(workspace_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 insert into public.iq_workspaces(name,owner_id) values(trim(workspace_name),auth.uid()) returning id into result;
 insert into public.iq_members values(result,auth.uid(),'admin');
 insert into public.iq_audit(workspace_id,actor,action,item_id) values(result,auth.uid(),'workspace-created',result);
 return result;
end $$;
create function public.iq_add_member(target uuid, member_user uuid, member_role text) returns void language plpgsql security definer set search_path='' as $$
begin
 if public.iq_role(target) is distinct from 'admin' then raise exception 'Administrator required'; end if;
 if member_role not in ('admin','sales','operations') then raise exception 'Unknown role'; end if;
 if exists(select 1 from public.iq_workspaces where id=target and owner_id=member_user) and member_role<>'admin' then raise exception 'Owner must remain administrator'; end if;
 insert into public.iq_members values(target,member_user,member_role) on conflict(workspace_id,user_id) do update set role=excluded.role;
 insert into public.iq_audit(workspace_id,actor,action,item_id) values(target,auth.uid(),'member-role-updated',member_user);
end $$;
create function public.iq_save_version(target uuid, payload jsonb, approve boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; number integer; q jsonb; service jsonb;
begin
 if coalesce(public.iq_role(target),'') not in ('admin','sales') then raise exception 'Sales or administrator required'; end if;
 if octet_length(payload::text)>1000000 then raise exception 'Snapshot too large'; end if;
 q=payload->'quote';
 if jsonb_typeof(q) is distinct from 'object' or coalesce(q->>'quoteNo','')='' then raise exception 'Invalid quotation'; end if;
 if approve then
  if q->>'city'='amsterdam' and (q->>'currency' is distinct from 'EUR' or coalesce((q->>'taxReviewed')::boolean,false)=false or coalesce(q->>'vatMode','pending') not in ('exclusive','inclusive','margin','none')) then raise exception 'Amsterdam currency or tax review incomplete';end if;
  if coalesce((payload->>'reviewConfirmed')::boolean,false)=false or coalesce((payload->>'blocking')::integer,1)<>0 or coalesce((payload->>'pending')::integer,1)<>0 then raise exception 'Review incomplete';end if;
  if coalesce(q->>'clientCompany','')='' or coalesce(q->>'serviceDate','')='' or coalesce(q->>'tourDuration','') not in ('Half day','Full day','Custom') or coalesce(q->>'pickupLocation','')='' or coalesce(q->>'dropoffLocation','')='' then raise exception 'Required request details missing';end if;
  if coalesce((q->>'adults')::integer,0)+coalesce((q->>'children')::integer,0)+coalesce((q->>'infants')::integer,0)<1 then raise exception 'Guest count missing';end if;
  if coalesce((q->>'adults')::integer,0)<0 or coalesce((q->>'children')::integer,0)<0 or coalesce((q->>'infants')::integer,0)<0 or coalesce((q->>'vehicleQty')::integer,0)<1 then raise exception 'Invalid guest or vehicle quantities';end if;
  if q->>'tourDuration'='Custom' and coalesce((q->>'customHours')::numeric,0)<1 then raise exception 'Custom duration missing';end if;
  if coalesce(q->>'validityDate','')='' or coalesce(q->>'quoteDate','')='' or (q->>'validityDate')::date<(q->>'quoteDate')::date or coalesce(trim(q->>'cancellation'),'')='' then raise exception 'Validity or cancellation terms missing';end if;
  if jsonb_typeof(q->'itinerary') is distinct from 'array' or not exists(select 1 from jsonb_array_elements(q->'itinerary') stop where stop->>'status' in ('Included','To be confirmed')) then raise exception 'Included itinerary missing';end if;
  if exists(select 1 from jsonb_array_elements(payload->'lines') line where coalesce((line->>'quantity')::numeric,0)<0 or coalesce((line->>'unitCost')::numeric,0)<0) then raise exception 'Negative cost input';end if;
  if jsonb_typeof(payload->'lines') is distinct from 'array' or jsonb_array_length(payload->'lines')=0 then raise exception 'Cost review missing';end if;
  if exists(select 1 from jsonb_array_elements(payload->'lines') line where coalesce((line->>'include')::boolean,false) and (line->>'type'<>'Conditional' or line->>'conditionStatus' in ('Included','Estimated risk')) and (coalesce(line->>'verification','') not in ('Verified','Internal estimate','Not required') or (line ? 'validFrom' and (q->>'serviceDate'<line->>'validFrom' or q->>'serviceDate'>line->>'validTo')))) then raise exception 'Supplier verification incomplete';end if;
 end if;
 -- Serialize numbering within a workspace. Versions cannot be overwritten through the API.
 perform 1 from public.iq_workspaces where id=target for update;
 select coalesce(max(version),0)+1 into number from public.iq_versions where workspace_id=target and reference=q->>'quoteNo';
 insert into public.iq_versions(workspace_id,reference,version,snapshot,approved,created_by) values(target,q->>'quoteNo',number,payload,approve,auth.uid()) returning id into result;
 if approve then
  service=jsonb_build_object('country',case when q->>'city'='amsterdam' then 'netherlands' else 'uae' end,'city',q->>'city','reference',q->>'quoteNo','version',number,'approvedAt',now(),'tourName',q->>'tourTitle','serviceDate',q->>'serviceDate','guestCount',coalesce((q->>'adults')::integer,0)+coalesce((q->>'children')::integer,0)+coalesce((q->>'infants')::integer,0),'adults',q->'adults','children',q->'children','infants',q->'infants','pickupLocation',q->>'pickupLocation','dropoffLocation',q->>'dropoffLocation','pickupTime',q->>'pickupTime','guideLanguage',q->>'guideLanguage','accessibility',q->>'accessibility','vehicleId',q->>'vehicleId','vehicleQty',q->'vehicleQty','airportPickup',q->'airportPickup','airportDropoff',q->'airportDropoff','itineraryStops',(select coalesce(jsonb_agg(jsonb_build_object('name',stop->>'name','note',stop->>'operationalNote')),'[]') from jsonb_array_elements(q->'itinerary') stop where stop->>'status'<>'Excluded'));
  if coalesce((q->>'airportPickup')::boolean,false) or coalesce((q->>'airportDropoff')::boolean,false) then service=service||jsonb_build_object('flightNumber',q->>'flightNumber','flightTime',q->>'flightTime','terminalNote',q->>'terminalNote');end if;
  insert into public.iq_handovers(version_id,workspace_id,service) values(result,target,service);
 end if;
 insert into public.iq_audit(workspace_id,actor,action,item_id) values(target,auth.uid(),case when approve then 'version-approved' else 'version-saved' end,result);
 return result;
end $$;
create function public.iq_audit_change() returns trigger language plpgsql security definer set search_path='' as $$
declare target uuid; item uuid;
begin
 if auth.uid() is null then return null;end if;
 if tg_table_name='iq_workspaces' then target=coalesce(new.id,old.id);item=target;else target=coalesce(new.workspace_id,old.workspace_id);item=coalesce(new.id,old.id);end if;
 insert into public.iq_audit(workspace_id,actor,action,item_id) values(target,auth.uid(),tg_table_name||'-'||lower(tg_op),item);
 return null;
end $$;
create trigger rate_audit after insert or update or delete on public.iq_rates for each row execute function public.iq_audit_change();
create trigger template_audit after insert or update or delete on public.iq_templates for each row execute function public.iq_audit_change();
create trigger settings_audit after update on public.iq_workspaces for each row execute function public.iq_audit_change();
revoke all on function public.iq_audit_change() from public,anon,authenticated;
revoke all on function public.iq_role(uuid),public.iq_create_workspace(text),public.iq_add_member(uuid,uuid,text),public.iq_save_version(uuid,jsonb,boolean) from public,anon;
grant execute on function public.iq_role(uuid),public.iq_create_workspace(text),public.iq_add_member(uuid,uuid,text),public.iq_save_version(uuid,jsonb,boolean) to authenticated;
commit;
