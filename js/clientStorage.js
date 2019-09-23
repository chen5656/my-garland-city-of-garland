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
    },

    removeItem:function(key){
        this.myGarlandInstance.removeItem(key).then();
    },

    getAll: function () {
        var array=[];
        var thisObj = this;
        return new Promise(function (resolve, reject) {
            thisObj.myGarlandInstance.iterate(function (value, key, iterationNumber) {          
                 array.push({
                    key:key,
                    value:value});
            }).then(function (e) {
             return resolve( array);                
            }).catch(function (err) {
                // This code runs if there were any errors
                console.log(err);
                return resolve(  array);
            });        
        });
    }
};