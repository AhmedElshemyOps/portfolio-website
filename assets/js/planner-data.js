window.InfraDispatchData = {
  async loadLocations(){
    const res = await fetch('../data/locations.json');
    const data = await res.json();
    const custom = JSON.parse(localStorage.getItem('infra_custom_places') || '[]');
    return { lastUpdated: data.lastUpdated, locations: [...data.locations, ...custom] };
  },

  getCustomPlaces(){
    return JSON.parse(localStorage.getItem('infra_custom_places') || '[]');
  },

  saveCustomPlace(place){
    const list = JSON.parse(localStorage.getItem('infra_custom_places') || '[]');
    const normalized = (place.name || '').trim().toLowerCase();
    const existing = list.find((p) => (p.name || '').trim().toLowerCase() === normalized);
    if (existing) {
      return { ...existing, duplicate: true };
    }

    const id = 'custom-' + Date.now();
    const item = { ...place, id, custom: true };
    list.push(item);
    localStorage.setItem('infra_custom_places', JSON.stringify(list));
    return item;
  }
};
