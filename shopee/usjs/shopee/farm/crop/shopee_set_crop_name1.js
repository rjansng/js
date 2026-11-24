const cropNameS = '4蝦幣'; // 用 ; 區隔，名稱越完整不容易錯
const cropNameI = '0'; // 0 從頭開始  1 任何位置
$persistentStore.write(cropNameS, 'ShopeeCropNameS');
$persistentStore.write(cropNameI, 'ShopeeCropNameI');
$persistentStore.write(cropNameS, '作物名稱');
$persistentStore.write(cropNameI, '作物名稱的判斷');

// const cropPrice = '0'; // 蝦幣最高需求  0 不需要蝦幣 ，需要的再自己改
// $persistentStore.write(cropPrice, 'ShopeeCropPrice');

console.log('設定\n主要種子 : ' + cropNameS + ' ✅');
console.log('定位 : ' + cropNameI + ' ✅');

//console.log('\n{M} : 會自動帶入 當月');
$done({});
