let map;
let currentMarker;
let stationingLocations = [];

function initMap() {
    map = L.map('map').setView([37.5665, 126.9780], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function addStationing() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            stationingLocations.push({lat, lon});
            localStorage.setItem('stationingLocations', JSON.stringify(stationingLocations));
            updateMap();
            updateZoneSelect();
        });
    }
}

function updateMap() {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            currentMarker = L.marker([lat, lon]).addTo(map);
            map.setView([lat, lon], 15);
            
            stationingLocations.forEach((location, index) => {
                L.circle([location.lat, location.lon], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 30
                }).addTo(map).bindPopup(`Stationing ${index + 1}`);
            });
        });
    }
}

function updateZoneSelect() {
    const zoneSelect = document.getElementById('zoneSelect');
    zoneSelect.innerHTML = '<option value="">영역 선택</option>';
    ['home', 'work', 'home-overlay', 'work-overlay', 'home-nearby', 'work-nearby', 'placing'].forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        zoneSelect.appendChild(option);
    });
    stationingLocations.forEach((_, index) => {
        const option = document.createElement('option');
        option.value = `stationing-${index}`;
        option.textContent = `Stationing ${index + 1}`;
        zoneSelect.appendChild(option);
    });
}

function addActivity() {
    document.getElementById('activityForm').style.display = 'block';
}

function submitActivity() {
    const zone = document.getElementById('zoneSelect').value;
    const activityType = document.getElementById('activityType').value;
    const activityDetail = document.getElementById('activityDetail').value;
    
    if (zone && activityDetail) {
        let activities = JSON.parse(localStorage.getItem('activities')) || {};
        if (!activities[zone]) {
            activities[zone] = [];
        }
        activities[zone].push({
            type: activityType,
            detail: activityDetail,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        alert('활동이 추가되었습니다.');
        document.getElementById('activityForm').style.display = 'none';
        document.getElementById('activityDetail').value = '';
    } else {
        alert('영역을 선택하고 활동 내용을 입력해주세요.');
    }
}

function viewActivities() {
    const activities = JSON.parse(localStorage.getItem('activities')) || {};
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    for (const [zone, zoneActivities] of Object.entries(activities)) {
        const zoneHeader = document.createElement('h3');
        zoneHeader.textContent = zone;
        activityList.appendChild(zoneHeader);
        zoneActivities.forEach(activity => {
            const activityItem = document.createElement('p');
            activityItem.textContent = `${new Date(activity.timestamp).toLocaleString()} - ${activity.type}: ${activity.detail}`;
            activityList.appendChild(activityItem);
        });
    }
    activityList.style.display = 'block';
}

document.getElementById('addStationing').addEventListener('click', addStationing);
document.getElementById('addActivity').addEventListener('click', addActivity);
document.getElementById('submitActivity').addEventListener('click', submitActivity);
document.getElementById('viewActivities').addEventListener('click', viewActivities);

initMap();
updateMap();
updateZoneSelect();
setInterval(updateMap, 60000); // 1분마다 지도 업데이트
