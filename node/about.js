const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const uuidV4 = require('uuid/v4')


module.exports = {
    fetchSqlfiles : function (inputPath, callback){
        if (fs.existsSync(inputPath)) {
            fs.readdir(inputPath, (err, files) => {
                const formedObject = [];
                var keyVal = _.reduce(files, function (formed, item) {
                    formedObject.push({ folder: inputPath, file: item, isSelected: 1 })
                }, {});
                callback(null,formedObject);
            })
        } else {
            alert('Path Not availa')
            callback('Path Not Exists', null)
        }
    },
    saveJob: function(data,fileName, fileType){
        const file = ((fileName||uuidV4())+('.')+(fileType||'json'))
        const dirr = path.join(__dirname,'../jobs',file)
        fs.writeFileSync(dirr,data);
    },
    concat: _.concat,
    uniq : _.uniq,
    uniqBy: _.uniqBy
}


/*module.exports.fetchSqlfiles(`G:\\projects\\NodeJs\\VS Code\\electron\\github\\node_mysql_query_parser\\css`, function(err,res){
    console.log(res);
})*/