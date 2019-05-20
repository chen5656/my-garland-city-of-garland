var myGarland = myGarland || {};
myGarland.clientStorage = function () {
    this.myGarlandInstance = localforage.createInstance({
        name: "myGarland"
    });
};

myGarland.clientStorage.prototype = {
    insertInfo: function (key, item) {
        this.myGarlandInstance.setItem(key, item).then();
    },

    getInfo: function (key) {
        var thisObj = this;
        return new Promise(function (resolve, reject) {
            thisObj.myGarlandInstance.getItem(key).then(function (result) {
                if (result) {
                    return resolve(result);

                } else {
                    return reject({
                        error: "no result of '".concat(key, "' found in local storage")
                    })
                }
            });
        });
    }
};