//myArray.push(_defineProperty({}, key, someValueArray)); --> ES6   myArray.push({ [key]: someValueArray });

var myGarland = myGarland || {};
myGarland.clientStorage = function () {
    this.myGarlandInstance = localforage.createInstance({
        name: "myGarland"
    });
};

myGarland.clientStorage.prototype = {
    insertInfo:function(key,item){
        this.myGarlandInstance.setItem(key, item).then();
    },


    getInfo: function (address) {
        var addr = address.split(",")[0].replace(/\s+/g, "-");
        var targetKeys = [addr + "-parcel", addr + "-facilityList", addr + "-serviceZone"];

        var thisObj = this;

        return new Promise(function (resolve, reject) {
            thisObj.myGarlandInstance.getItems(targetKeys).then(function (result) {
                var arrays = Object.keys(result).map(function (e) {
                    return result[e];
                });
                if (targetKeys.length === arrays.length) {
                    var array = [].concat.apply([], arrays);
                    template.appendToPage(array, address);
                    resolve();
                } else {
                    reject({
                        error: "can't find data in indexDB"
                    });
                }
            });

        });
    }
};