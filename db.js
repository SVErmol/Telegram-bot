let missionList = [];

export function getMyMissions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(missionList);
    }, 500);
  });
}

export function addMission(text) {
  missionList.push(text);
}

export function deleteMission(id) {
  missionList.splice(id, 1);
}
