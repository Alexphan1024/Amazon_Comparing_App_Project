const fs = require('fs');
const modules = require('./modules.js');
const express = require('express');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
const app = express();


app.set('View engine', 'hbs');

app.use(fileUpload());
app.use(express.static(__dirname +'/public'))

app.get('/',function(req,res){

});

app.post('/analyze',function(req,res){
   var uploadedFile = req.files.facetosearch;
   modules.uploadingImage(uploadedFile)
   var url = modules.getUrl(uploadedFile);
   modules.getLabels(uploadedFile,(err,result)=>{
    if (err){
      console.log(err);
    }else{
      var lab_list = result.Labels
      console.log("primary",lab_list.length);
      while(lab_list.length < 5){
        lab_list.push({"Name":"","Confidence":""})
        console.log(lab_list.length);
      }
      console.log(lab_list);
      res.render('analyze.hbs',{
      data1 : lab_list[0],
      data2 : lab_list[1],
      data3 : lab_list[2],
      data4 : lab_list[3],
      data5 : lab_list[4],
      img : url
        });
    }
   });
  
});

app.post('/celeb',function(req,res){

  var uploadedFile = req.files.findceleb;
  modules.uploadingImage(uploadedFile)
  var url = modules.getUrl(uploadedFile);
  modules.getCelebrities(uploadedFile,(err,result)=>{
    if (err){
        console.log(err);
      }else{
        var cel_result = result
      }
      if( cel_result.CelebrityFaces.length > 0){
          var cel_list = result.CelebrityFaces[0];
          res.render('celeb.hbs',{
            Name: cel_list.Name,
            img : url,
            url : cel_list.Urls,
            conf: cel_list.MatchConfidence
           });
        }else{
            res.render('Error.hbs',{
                conf: cel_result.UnrecognizedFaces[0].Confidence
            })
        }
   });
});

app.post('/compare',function(req,res){

  var srcimg = req.files.imgOne;
  var trgimg = req.files.imgTwo;
  modules.uploadingImage(srcimg)
  modules.uploadingImage(trgimg)
  var urlone = modules.getUrl(srcimg);
  var urltwo = modules.getUrl(trgimg);

  setTimeout(() => {
    modules.ComparingImage(srcimg,trgimg,(err,result)=>{
     if (err){
        console.log(err);
      }else{
        var comp_list = result;
          console.log("result",comp_list);
        if( comp_list.FaceMatches.length > 0){
            console.log()
            var match_list = comp_list.FaceMatches[0];

          res.render('compare.hbs',{
            imgOne : urlone,
            imgTwo : urltwo,
            conf: comp_list.SourceImageFace.Confidence,
            sims: match_list.Similarity,
            result: "https://png.icons8.com/metro/1600/equal-sign.png"
           });
        }
        else{
            res.render('compare.hbs',{
            imgOne : urlone,
            imgTwo : urltwo,
            conf: comp_list.SourceImageFace.Confidence,
            sims: 10,
            result: "https://cdn4.iconfinder.com/data/icons/mathematical-symbols/51/Not_Equal_Sign-512.png"
           });
        }
      }


   }, 4000);
  });
});


app.listen(8080)
