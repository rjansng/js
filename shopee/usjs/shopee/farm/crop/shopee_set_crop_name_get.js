console.log('\n主要種子 : \n' + $persistentStore.read('作物名稱') || '');
console.log('\n次要種子 : \n' + $persistentStore.read('ShopeeCropNameSB') || '');
$done({});
