const AWS = require('aws-sdk')
const s3 = new AWS.S3()

AWS.config.loadFromPath('./config.json');

const rekognition = new AWS.Rekognition({ apiVersion: '2016-06-27'});

//Uploading Image to AWS S3 storage
var uploadingImage = (image) =>{

     var params = {
         Bucket: 'joonrekog',
         Key: image.name,
         ContentType: image.mimetype,
         Body: image.data,
         ACL: 'public-read' //Bucket is public access
       }

   s3.putObject(params, (err, res) => { //Upload image into Bucket:"joonrekog"
       if (err) {
         console.log('Failed to Upload: ', err) //If error happen while uploading
       } else {
          console.log('successfully uploaded'); //File uploaded succesfully
        }
       });

};

var getUrl = (image)=>{
  var params = {Bucket: 'joonrekog', Key: image.name};
  var url = s3.getSignedUrl('getObject', params);
  return url
};

// Deleting Image that is stored in AWS S3
var deleteImage = (image) => {
    var params = {  
      Bucket: 'joonrekog', 
      Key: image.name // name of picture
      };
    
    s3.deleteObject(params, function(err, data) {
      if (err) console.log(err, err.stack);  // If error happen while deleting image from s3
      else     console.log('successfully removed from database'); //Image is deleted from s3 storage
    });

}


//Find a celebrity.
var getCelebrities = (image, callback) => { 

    var params = { 
      Image: { //require
        S3Object: {
          Bucket: 'joonrekog',
          Name: image.name 
        }
      }
    };

    rekognition.recognizeCelebrities(params, function(err, data) { //API checks the image request result from aws rekognition.
      if(err) {
        callback(err.stack); //if error happend
      }else{
        callback(undefined, data); 
        //If celeb -> return Name, Confidence Level,URL, Celeb ID(Unique Celeb ID stored in Amazon database
      }        
  });
}

//Detecting labels -> is about what kind of things are in the picture
var getLabels = (image, callback) => { 

      var params = {
         Image: {
         S3Object: {
           Bucket: "joonrekog", 
           Name: image.name //name of file
        }
      }
    }

    rekognition.detectLabels(params, (err, data) => {
       if (err) {
        callback(err.stack)
       } //if error happen
       else {
        callback(undefined, data)
     }; 
         //Return list of dictionary -> Dictionary has 2 keys 1.Label 2.Confidence
     });

}

// Compare two Image
var ComparingImage = (srcImg,trgImg, callback) => { //require two parameter SourceImage and TargetImage

  var params= (
    {
      SourceImage: {
        S3Object: {
          Bucket: "joonrekog",
          Name: srcImg.name
        }
      },
      TargetImage: {
        S3Object: {
          Bucket: "joonrekog",
          Name: trgImg.name
            }
        }
      }
    )

  rekognition.compareFaces(params, function(err, data) {
     if (err) {
     callback(err.stack);
     }else {
      callback(undefined, data); //if successfully response, it return lists of Match and Unmatch. MatchFaces return -> similiarity                                                                                          //Unmatch returns -> Confidence Level
     } 
   });
};

module.exports = { //Exporting modules
    uploadingImage,
    deleteImage,
    getCelebrities,
    getLabels,
    ComparingImage,
    getUrl
};

