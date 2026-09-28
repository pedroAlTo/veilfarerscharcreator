const root='/assets/behind-the-veil/';
const sequence=(folder,prefix,count,pad=0,start=1)=>Array.from({length:count},(_,i)=>`${root}${folder}/${prefix}${String(i+start).padStart(pad,'0')}.png`);
export const droneSprites={
  scout:{frames:sequence('drones/scout','Ch_3_Idle_',4),crop:[99,22,3,31,30]},
  down:{frames:sequence('drones/scout','Ch_3_Death_',24),crop:[99,22,3,31,30],bottoms:[32,31,37,44,50,49,53,53,53,53,53,53,52,53,53,53,53,53,53,53,53,53,53,53]},
  pod:{frames:sequence('overkill/recovery-drone','DronePod-Movement_',8),crop:[97,23,18,38,27]},
  spider:{frames:Array(4).fill(`${root}drones/spider-drone.png`),crop:[409,-3,59,32,24],sheet:true},
  pilot:{frames:sequence('overkill/hero','Hero2-Idle_',4,2),crop:[40,1,21,21,28]},
  scoundrel:{frames:sequence('overkill/hero-alt','Hero3-Idle_',4,2),crop:[40,2,21,20,28]},
  engineer:{frames:sequence('overkill/hero-4','Hero4-Idle_',4,2),crop:[54,16,21,19,28]},
  diplomat:{frames:sequence('overkill/hero-5','Hero5-Idle_',4,2),crop:[54,16,21,20,28]},
  guard:{frames:sequence('overkill/hero-6','Hero6-Idle_',4,2),crop:[54,16,21,19,29]},
  guardRun:{frames:sequence('overkill/hero-6','Hero6-Run_',5,2),crop:[54,16,21,19,29]},
  pilotRun:{frames:sequence('overkill/hero','Hero2-Run_',5,2),crop:[40,1,21,21,28]},
  scoundrelRun:{frames:sequence('overkill/hero-alt','Hero3-Run_',5,2),crop:[40,2,21,20,28]},
  engineerRun:{frames:sequence('overkill/hero-4','Hero4-Run_',5,2),crop:[54,16,21,19,28]},
  diplomatRun:{frames:sequence('overkill/hero-5','Hero5-Run_',5,2),crop:[54,16,21,20,28]},
  cover:{frames:[root+'drones/props/crew-chest.png'],crop:[32,1,0,30,15]},
  shutter:{frames:sequence('drones/props','DropDoorYVert_',7,2),crop:[16,0,0,16,58]},
  terminal:{frames:sequence('drones/props','NOC-ConsoleA_',3,2),crop:[32,12,9,20,71]},
  door:{frames:sequence('drones/props','SlideDoorY_',8,2),crop:[64,0,0,64,48]},
  crate:{frames:[`${root}drones/props/crate.png`],crop:[16,2,12,12,20]},
  gun:{frames:[`${root}overkill/weapons/player-laser-gun.png`],crop:[29,3,5,15,7]},
  beam:{frames:[`${root}overkill/fx/laser-bullet.png`]},
  impact:{frames:sequence('overkill/fx','Laser-Impact_',3)}
};
