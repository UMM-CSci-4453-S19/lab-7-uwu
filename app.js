var express=require('express'),
    app = express(),
    port = process.env.PORT || 1337;

app.use(express.static(__dirname + '/public'));
app.get("/buttons",function(req,res){
    res.send("Hello World!  May I interest you in some... <em>buttons</em>?<button onclick='alert(\"BIG Cool\")'>Ahnaf is Cool button</button><button onclick='alert(\"FakeNews\")'>Ahnaf is NOT Cool button</button>");
});
app.listen(port);