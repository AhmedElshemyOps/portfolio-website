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
 perform 1 from public.iq_workspaces where id=target for update;
 if not exists(select 1 from public.iq_members where workspace_id=target and user_id=member_user) and (select count(*) from public.iq_members where workspace_id=target)>=11 then raise exception 'Workspace membership limit reached'; end if;
 if exists(select 1 from public.iq_workspaces where id=target and owner_id=member_user) and member_role<>'admin' then raise exception 'Owner must remain administrator'; end if;
 insert into public.iq_members values(target,member_user,member_role) on conflict(workspace_id,user_id) do update set role=excluded.role;
 insert into public.iq_audit(workspace_id,actor,action,item_id) values(target,auth.uid(),'member-role-updated',member_user);
end $$;
create function public.iq_remove_member(target uuid, member_user uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or public.iq_role(target) is distinct from 'admin' then raise exception 'Administrator required'; end if;
 if member_user is null then raise exception 'Member is required'; end if;
 if exists(select 1 from public.iq_workspaces where id=target and owner_id=member_user) then raise exception 'Workspace owner cannot be removed'; end if;
 delete from public.iq_members where workspace_id=target and user_id=member_user;
 if not found then raise exception 'Workspace member not found'; end if;
 insert into public.iq_audit(workspace_id,actor,action,item_id) values(target,auth.uid(),'member-removed',member_user);
end $$;
create function public.iq_save_version(target uuid, payload jsonb, approve boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; number integer; q jsonb; service jsonb; line jsonb; quote_cost jsonb; server_cost numeric := 0; server_pending integer := 0; verified_count integer := 0; server_raw numeric; server_before_vat numeric; server_vat numeric; server_final numeric; vat_rate numeric; round_step numeric;
begin
 if coalesce(public.iq_role(target),'') not in ('admin','sales') then raise exception 'Sales or administrator required'; end if;
 if octet_length(payload::text)>1000000 then raise exception 'Snapshot too large'; end if;
 q=payload->'quote';
 if jsonb_typeof(q) is distinct from 'object' or coalesce(q->>'quoteNo','')='' then raise exception 'Invalid quotation'; end if;
 if approve then
  if jsonb_typeof(payload->'lines') is distinct from 'array' or jsonb_array_length(payload->'lines')=0 or jsonb_typeof(q->'costs') is distinct from 'array' then raise exception 'Cost review missing'; end if;
  for quote_cost in select value from jsonb_array_elements(q->'costs') loop
   if not exists(select 1 from jsonb_array_elements(payload->'lines') candidate where candidate->>'name'=quote_cost->>'name' and candidate->>'quantity'=quote_cost->>'quantity' and candidate->>'unitCost'=quote_cost->>'unitCost' and coalesce(candidate->>'include','true')=coalesce(quote_cost->>'include','true')) then raise exception 'Quotation cost lines do not reconcile'; end if;
  end loop;
  if coalesce((payload->>'reviewConfirmed')::boolean,false)=false then raise exception 'Review confirmation missing'; end if;
  if q->>'city'='amsterdam' and (q->>'currency' is distinct from 'EUR' or coalesce((q->>'taxReviewed')::boolean,false)=false or coalesce(q->>'vatMode','pending') not in ('exclusive','inclusive','margin','none')) then raise exception 'Amsterdam currency or tax review incomplete'; end if;
  if coalesce(q->>'quoteNo','')='' or coalesce(q->>'clientCompany','')='' or coalesce(q->>'tourTitle','')='' or coalesce(q->>'serviceDate','')='' or coalesce(q->>'tourDuration','') not in ('Half day','Full day','Custom') or coalesce(q->>'pickupLocation','')='' or coalesce(q->>'dropoffLocation','')='' then raise exception 'Required request details missing'; end if;
  if coalesce((q->>'adults')::integer,0)+coalesce((q->>'children')::integer,0)+coalesce((q->>'infants')::integer,0)<1 then raise exception 'Guest count missing'; end if;
  if coalesce((q->>'adults')::integer,0)<0 or coalesce((q->>'children')::integer,0)<0 or coalesce((q->>'infants')::integer,0)<0 or coalesce((q->>'vehicleQty')::integer,0)<1 then raise exception 'Invalid guest or vehicle quantities'; end if;
  if q->>'tourDuration'='Custom' and coalesce((q->>'customHours')::numeric,0)<1 then raise exception 'Custom duration missing'; end if;
  if coalesce(q->>'validityDate','')='' or coalesce(q->>'quoteDate','')='' or (q->>'validityDate')::date<(q->>'quoteDate')::date or coalesce(trim(q->>'cancellation'),'')='' then raise exception 'Validity or cancellation terms missing'; end if;
  if jsonb_typeof(q->'itinerary') is distinct from 'array' or not exists(select 1 from jsonb_array_elements(q->'itinerary') stop where stop->>'status' in ('Included','To be confirmed')) then raise exception 'Included itinerary missing'; end if;
  if exists(select 1 from jsonb_array_elements(q->'itinerary') stop where stop->>'status' in ('Included','To be confirmed') and coalesce((stop->>'ticketRequired')::boolean,false) and coalesce(stop->>'ticketVerification','') not in ('Verified','Client pays directly','Not required')) then raise exception 'Included attraction ticket verification incomplete'; end if;
  if q->>'city'='amsterdam' and exists(select 1 from jsonb_array_elements(q->'itinerary') stop where stop->>'status' in ('Included','To be confirmed') and coalesce((stop->>'ticketRequired')::boolean,false) and (coalesce((stop->>'priceConfirmed')::boolean,false)=false or stop->>'priceConfirmedDate' is distinct from q->>'serviceDate' or coalesce((stop->>'availabilityConfirmed')::boolean,false)=false or stop->>'availabilityDate' is distinct from q->>'serviceDate' or coalesce((stop->>'conditionsReviewed')::boolean,false)=false or stop->>'conditionsReviewedDate' is distinct from q->>'serviceDate')) then raise exception 'Amsterdam ticket date, availability or conditions incomplete'; end if;
  if coalesce((q->>'riskBuffer')::numeric,0)<0 then raise exception 'Invalid risk buffer'; end if;
  if coalesce(q->>'currency','') not in ('AED','EUR') then raise exception 'Unsupported quotation currency'; end if;
  for line in select value from jsonb_array_elements(payload->'lines') loop
   if jsonb_typeof(line) is distinct from 'object' or coalesce(trim(line->>'name'),'')='' or coalesce(line->>'type','') not in ('Fixed','Variable','Conditional') or jsonb_typeof(line->'include') is distinct from 'boolean' then raise exception 'Invalid cost line'; end if;
   if coalesce((line->>'quantity')::numeric,0)<0 or coalesce((line->>'unitCost')::numeric,0)<0 then raise exception 'Negative cost input'; end if;
   if coalesce((line->>'quantity')::numeric,0)>1000000 or coalesce((line->>'unitCost')::numeric,0)>100000000 then raise exception 'Cost input exceeds supported limits'; end if;
   if coalesce((line->>'include')::boolean,false) and (coalesce((line->>'quantity')::numeric,0)<=0 or coalesce(line->>'verification','') not in ('Verified','Internal estimate','Not required')) then server_pending:=server_pending+1; end if;
   if coalesce((line->>'include')::boolean,false) and line->>'verification'='Not required' and coalesce((line->>'unitCost')::numeric,0)<>0 then raise exception 'Not-required costs must be zero'; end if;
   if coalesce((line->>'include')::boolean,false) and line->>'type'='Conditional' and line->>'conditionStatus' in ('Pending confirmation','Estimated risk') then server_pending:=server_pending+1; end if;
   if coalesce((line->>'include')::boolean,false) and (line->>'type'<>'Conditional' or coalesce(line->>'conditionStatus','Included') in ('Included','Estimated risk')) then
    server_cost:=server_cost + (coalesce((line->>'quantity')::numeric,0)*coalesce((line->>'unitCost')::numeric,0));
   end if;
   if coalesce((line->>'include')::boolean,false) and line->>'verification'='Verified' then
    if not exists(select 1 from public.iq_rates r where r.workspace_id=target and r.name=line->>'name' and r.supplier=coalesce(line->>'supplier','') and r.unit_cost=(line->>'unitCost')::numeric and r.currency=q->>'currency' and r.verified and r.valid_from<=(q->>'serviceDate')::date and r.valid_to>=(q->>'serviceDate')::date) then raise exception 'Verified cost line has no matching current workspace rate'; end if;
    verified_count:=verified_count+1;
   end if;
  end loop;
  server_cost:=server_cost+coalesce((q->>'riskBuffer')::numeric,0);
  if server_pending>0 then raise exception 'Included cost review incomplete'; end if;
  vat_rate:=case when q->>'city'='amsterdam' then 0.21 else 0.05 end;
  round_step:=greatest(coalesce((q->>'rounding')::numeric,5),1);
  if coalesce(q->>'pricingMethod','margin')='margin' then
   if coalesce((q->>'targetMargin')::numeric,0)<0 or coalesce((q->>'targetMargin')::numeric,0)>=100 then raise exception 'Invalid target margin'; end if;
   if q->>'vatMode'='margin' then
    server_raw:=case when 1-(coalesce((q->>'targetMargin')::numeric,0)/100)*(1+vat_rate)>0 then server_cost/(1-(coalesce((q->>'targetMargin')::numeric,0)/100)*(1+vat_rate)) else 0 end;
   else
    server_raw:=case when 1-(coalesce((q->>'targetMargin')::numeric,0)/100)>0 then server_cost/(1-(coalesce((q->>'targetMargin')::numeric,0)/100)) else 0 end;
   end if;
  elsif q->>'pricingMethod'='markup' then
   if coalesce((q->>'markupPct')::numeric,0)<0 then raise exception 'Invalid markup'; end if;
   server_raw:=server_cost*(1+coalesce((q->>'markupPct')::numeric,0)/100);
  else raise exception 'Unsupported pricing method'; end if;
  if q->>'vatMode'='margin' then
   server_final:=ceil(server_raw/round_step)*round_step;
  elsif q->>'vatMode'='inclusive' then
   server_final:=ceil((server_raw*(1+vat_rate))/round_step)*round_step;
  else server_final:=ceil(server_raw/round_step)*round_step; end if;
  if q->>'vatMode'='exclusive' then
   server_before_vat:=server_final;
   server_vat:=round(server_before_vat*vat_rate,2);
   server_final:=server_before_vat+server_vat;
  elsif q->>'vatMode'='inclusive' then
   server_before_vat:=round(server_final/(1+vat_rate),2);
  elsif q->>'vatMode'='margin' then
   server_vat:=round(greatest(0,server_final-server_cost)*vat_rate/(1+vat_rate),2);
  else server_before_vat:=server_final; end if;
  if abs(server_final-coalesce((payload->>'claimedFinalPrice')::numeric,-1))>0.02 then raise exception 'Quotation total does not reconcile with server-calculated costs'; end if;
 end if;
 -- Serialize numbering within a workspace. Versions cannot be overwritten through the API.
 perform 1 from public.iq_workspaces where id=target for update;
 select coalesce(max(version),0)+1 into number from public.iq_versions where workspace_id=target and reference=q->>'quoteNo';
 insert into public.iq_versions(workspace_id,reference,version,snapshot,approved,created_by) values(target,q->>'quoteNo',number,case when approve then payload||jsonb_build_object('serverReview',jsonb_build_object('includedCost',server_cost,'serverFinalPrice',server_final,'currency',q->>'currency','verifiedRateLines',verified_count,'validatedAt',now())) else payload end,approve,auth.uid()) returning id into result;
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
revoke all on function public.iq_role(uuid),public.iq_create_workspace(text),public.iq_add_member(uuid,uuid,text),public.iq_remove_member(uuid,uuid),public.iq_save_version(uuid,jsonb,boolean) from public,anon;
grant execute on function public.iq_role(uuid),public.iq_create_workspace(text),public.iq_add_member(uuid,uuid,text),public.iq_remove_member(uuid,uuid),public.iq_save_version(uuid,jsonb,boolean) to authenticated;
commit;
