var credentials = require("./credentials.json");
var mysql = require('mysql');
var Promise = require('bluebird');
Promise.promisfyAll(require("mysql/lib/Connection").prototype);
Promise.promisfyAll(require("mysql/lib/Pool").prototype);

credentials.host = "ids";

var express=require('express'),
app = express(),
port = process.env.PORT || 1337;

var buttons=[{"buttonID":1,"left":10,"top":70,"width":100,"label":"hot dogs","invID":1},{"buttonID":2,"left":110,"top":70,"width":100,"label":"hamburgers","invID":2},{"buttonID":3,"left":210,"top":70,"width":100,"label":"bananas","invID":3},{"buttonID":4,"left":10,"top":120,"width":100,"label":"milk duds","invID":4}]; //static buttons

app.use(express.static(__dirname + '/public')); //Serves the web pages
app.get("/buttons",function(req,res){ // handles the /buttons API
  res.send(buttons);
});

app.listen(port);

///// We have to update server code here to talk to the sql database using promises and bring code back as a json object
///// We need a table with data fields such as `buttonID` `left` `top` `width` `label` and `invID`

// Get databases gets the till_buttons database
var getDatabases=function(){
    var sql = "USE till_buttons";
    return dbf.query(mysql.format(sql));
};

// Process Database and get
var processDBFs=function(queryResults){
    var dbfs=queryResults;
    return(Promise.all(dbfs.map(dbfToPromise)).then(processTables));
};


var processTables=function(results){
    var descriptionPromises=results.map(tableAndDbfToPromise);
    var allTables=Promise.all(descriptionPromises).then(function(results){return(results)});
    return(allTables);
};

var dbfToPromise=function(dbfObj){
    var dbf=dbfObj.Database;
    var sql = mysql.format("SHOW TABLES IN ??",dbf);
    var queryPromise=DBF.query(sql);
    queryPromise=queryPromise.then(function(results){return({table:results,dbf:dbf})});
    return(queryPromise);
};

var tableAndDbfToPromise=function(obj){
    var dbf=obj.dbf;
    var tableObj=obj.table;
    var key = "Tables_in_"+dbf;

    var tables=tableObj.map(function(val){return(val[key])});

    var describeTable=function(val,index){
        var table=dbf+"."+val;
        var printer=function(results){
            var desc=results;
            if(index==0){
                console.log("---|",dbf,">")
            }
            console.log(".....|"+table,">");
            desc.map(function(field){ // show the fields nicely
                console.log("\tFieldName: `"+field.Field+"` \t("+field.Type+")");
            })
        };

        var describeSQL=mysql.format("DESCRIBE ??",table);
        var promise=DBF.query(describeSQL).then(printer);
        return(promise);
    };
    var describePromises = tables.map(describeTable);
    return(Promise.all(describePromises))
};

var dbf=getDatabases()
    .then(processDBFs)
    .then(DBF.releaseDBF)
    .catch(function(err){
        console.log("DANGER:",err);
    });
