myApp.factory('loadAssets', function ($q) {

    var jsPath = "scripts/",
        cssPath = "css/",
        imagesPath = "images/",
        head = document.getElementsByTagName("head")[0]; // define starting paths for each file tile

    const imgFileTypes = [
        "png",
        "gif",
        "jpg",
        "jpeg",
    ]

    return {
        startLoad: function (url) {
                var fileType = url.split(".").slice(-1); // we must get (length - 1) because filenames like jquery.min.js
                 this.loadedAssets == this.loadedAssets || [];

                if (this.loadedAssets.indexOf(url) >= 0) { // note that indexOf supported only in ie9+ , add fallback if you want to support legacy browsers.
                    return true;
                } else {
                    this.loadedAssets.push.apply(this.loadedAssets, [url]);

                    // load js files
                    if (fileType == "js") {
                        var jsFile = document.createElement("script");
                        jsFile.src = jsPath + url;
                        head.appendChild(jsFile);
                        var waitforload = $q.defer();

                        jsFile.onload = function () {
                            waitforload.resolve(jsFile);
                        };
                        jsFile.onerror = function (e) {
                            waitforload.reject(e);
                            console.log("Could not load " + jsFile.src);
                        };

                        return waitforload.promise;
                    }

                    // load css files
                    if (fileType == "css") {
                        var cssFile = document.createElement("link");
                        cssFile.setAttribute("rel", "stylesheet");
                        cssFile.setAttribute("type", "text/css");
                        cssFile.setAttribute("href", cssPath+url);
                        head.appendChild(cssFile);
                    }


                    // load images
                    if (imgFileTypes.indexOf(fileType) >0) {
                        var waitforload = $q.defer();
                        var image = new Image();
                        image.src = imagesPath + url;

                        image.onload = function () {
                            waitforload.resolve(image);
                        };
                        image.onerror = function (e) {
                            waitforload.reject(e);
                            console.log("Could not load " + image.src);
                        };

                        return waitforload.promise;
                    }
                }

        },
        loadedAssets: this.loadedAssets
    }
}); 