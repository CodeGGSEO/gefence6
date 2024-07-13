let map;
let currentMarker;
let stationingLocations = [];
let zoneCircles = {};
let tempCircle;

function initMap() {
    map = L.map('map').setView([37.5665, 126.9780], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('move', updateTempCircle);
}

function updateTempCircle() {
    if (tempCircle) {
        map.removeLayer(tempCircle);
    }
    const center = map.getCenter();
    tempCircle = L.circle(center, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.2,
        radius: 30
    }).addTo(map);
}

function addStationing() {
    const center = map.getCenter();
    const lat = center.lat;
    const lon = center.lng;
    
    const newStationing = {
        lat,
        lon,
        createdAt: new Date().toISOString()
    };
    stationingLocations.push(newStationing);
    localStorage.setItem('stationingLocations', JSON.stringify(stationingLocations));
    updateMap();
    updateZoneSelect();
    updateStationingButtons();
    alert(`Stationing ${stationingLocations.length}이 추가되었습니다.`);
}

function updateMap() {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // Clear existing zone circles
    for (let key in zoneCircles) {
        if (zoneCircles.hasOwnProperty(key)) {
            map.removeLayer(zoneCircles[key]);
        }
    }
    
    // Add circles for home and work
    const homeLocation = JSON.parse(localStorage.getItem('homeLocation'));
    const workLocation = JSON.parse(localStorage.getItem('workLocation'));
    
    if (homeLocation) {
        zoneCircles['home'] = L.circle([homeLocation.lat, homeLocation.lon], {
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.2,
            radius: 10
        }).addTo(map).bindPopup("Home");
        
        zoneCircles['home-overlay'] = L.circle([homeLocation.lat, homeLocation.lon], {
            color: 'lightblue',
            fillColor: '#30f',
            fillOpacity: 0.1,
            radius: 15
        }).addTo(map).bindPopup("Home Overlay");
        
        zoneCircles['home-nearby'] = L.circle([homeLocation.lat, homeLocation.lon], {
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.05,
            radius: 3015
        }).addTo(map).bindPopup("Home Nearby");
    }
    
    if (workLocation) {
        zoneCircles['work'] = L.circle([workLocation.lat, workLocation.lon], {
            color: 'green',
            fillColor: '#3f0',
            fillOpacity: 0.2,
            radius: 30
        }).addTo(map).bindPopup("Work");
        
        zoneCircles['work-overlay'] = L.circle([workLocation.lat, workLocation.lon], {
            color: 'lightgreen',
            fillColor: '#3f0',
            fillOpacity: 0.1,
            radius: 35
        }).addTo(map).bindPopup("Work Overlay");
        
        zoneCircles['work-nearby'] = L.circle([workLocation.lat, workLocation.lon], {
            color: 'green',
            fillColor: '#3f0',
            fillOpacity: 0.05,
            radius: 3035
        }).addTo(map).bindPopup("Work Nearby");
    }
    
    stationingLocations.forEach((location, index) => {
        zoneCircles[`stationing-${index + 1}`] = L.circle([location.lat, location.lon], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.2,
            radius: 30
        }).addTo(map).bindPopup(`Stationing ${index + 1}`);
    });

    updateTempCircle();
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
        option.value = `stationing-${index + 1}`;
        option.textContent = `Stationing ${index + 1}`;
        zoneSelect.appendChild(option);
    });
}

function updateStationingButtons() {
    const stationingButtonsContainer = document.getElementById('stationingButtons');
    stationingButtonsContainer.innerHTML = '';
    stationingLocations.forEach((location, index) => {
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';

        const viewButton = document.createElement('button');
        viewButton.textContent = `S${index + 1}`; // S는 Stationing의 약자
        viewButton.title = `Stationing ${index + 1}`;
        viewButton.addEventListener('click', () => {
            map.setView([location.lat, location.lon], 15);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', () => {
            deleteStationing(index);
        });

        const historyButton = document.createElement('button');
        historyButton.textContent = '이력';
        historyButton.addEventListener('click', () => {
            showStationingHistory(location);
        });

        buttonGroup.appendChild(viewButton);
        buttonGroup.appendChild(deleteButton);
        buttonGroup.appendChild(historyButton);
        stationingButtonsContainer.appendChild(buttonGroup);
    });
}

function deleteStationing(index) {
    if (confirm(`Stationing ${index + 1}을 삭제하시겠습니까?`)) {
        stationingLocations.splice(index, 1);
        localStorage.setItem('stationingLocations', JSON.stringify(stationingLocations));
        
        // Delete activities for this stationing
        let activities = JSON.parse(localStorage.getItem('activities')) || {};
        delete activities[`stationing-${index + 1}`];
        localStorage.setItem('activities', JSON.stringify(activities));
        
        updateMap();
        updateZoneSelect();
        updateStationingButtons();
    }
}

function showStationingHistory(location) {
    alert(`생성 일시: ${new Date(location.createdAt).toLocaleString()}`);
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

function showHome() {
    const homeLocation = JSON.parse(localStorage.getItem('homeLocation'));
    if (homeLocation) {
        map.setView([homeLocation.lat, homeLocation.lon], 15);
    } else {
        alert('집 위치가 설정되지 않았습니다.');
    }
}

function showWork() {
    const workLocation = JSON.parse(localStorage.getItem('workLocation'));
    if (workLocation) {
        map.setView([workLocation.lat, workLocation.lon], 15);
    } else {
        alert('직장 위치가 설정되지 않았습니다.');
    }
}

function clearAllStationings() {
    if (confirm('모든 Stationing을 삭제하시겠습니까?')) {
        stationingLocations = [];
        localStorage.setItem('stationingLocations', JSON.stringify(stationingLocations));
        updateMap();
        updateZoneSelect();
        updateStationingButtons();
        alert('모든 Stationing이 삭제되었습니다.');
    }
}

function clearAllActivities() {
    if (confirm('모든 활동 이력을 삭제하시겠습니까?')) {
        localStorage.removeItem('activities');
        alert('모든 활동 이력이 삭제되었습니다.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    stationingLocations = JSON.parse(localStorage.getItem('stationingLocations')) || [];
    updateMap();
    updateZoneSelect();
    updateStationingButtons();
    
    document.getElementById('addStationing').addEventListener('click', addStationing);
    document.getElementById('addActivity').addEventListener('click', addActivity);
    document.getElementById('submitActivity').addEventListener('click', submitActivity);
    document.getElementById('viewActivities').addEventListener('click', viewActivities);
    document.getElementById('showHome').addEventListener('click', showHome);
    document.getElementById('showWork').addEventListener('click', showWork);
    document.getElementById('clearAllStationings').addEventListener('click', clearAllStationings);
    document.getElementById('clearAllActivities').addEventListener('click', clearAllActivities);
});

// End of file
