const cropNameS = '77乳加'; // 用 ; 區隔，名稱越完整不容易錯
const cropNameI = '1'; // 0 從頭開始  1 任何位置
$persistentStore.write(cropNameS, 'ShopeeCropNameS');
$persistentStore.write(cropNameI, 'ShopeeCropNameI');
$persistentStore.write(cropNameS, '作物名稱');
$persistentStore.write(cropNameI, '作物名稱的判斷');
console.log('設定\n主要種子 : ' + cropNameS + ' ✅');
console.log('定位 : ' + cropNameI + ' ✅');
$done({});
