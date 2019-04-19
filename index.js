var express = require('express')
var app = express()
const bodyparser = require('body-parser')
const download = require('image-downloader')

//slicing
var sizeOf = require('image-size');
var imageToSlices = require('image-to-slices');

imageToSlices.configure({
    clipperOptions: {
        canvas: require('canvas')
    }
});

//dossier thing
const fs = require('fs'); //file system

app.use(bodyparser.json());

//affichage
var publicDir = require('path').join(__dirname, '/before-img');
app.use(express.static(publicDir));
//

app.post('/', (req, res) => {
    const random = Date.now(); //unix timestamp en millisecondes
    fs.mkdirSync('./before-img/' + random + '/'); //***

    //download image
    options = {
        url: req.body.imgUrl,
        dest: './before-img/image.png'//+random
    }

    download.image(options)
        .then(({ filename, image }) => {
            console.log('File saved to', filename)
            //image splitter
            var nv = req.body.numberVer;
            var nh = req.body.numberHor;
            var dimensions = sizeOf('before-img/image.png');
            console.log(nv, dimensions.width, dimensions.height);

            var width = dimensions.width / nv;
            var height = dimensions.height / nh;
            var lineYArray = [];
            var lineXArray = [];
            for (var i = 1; i < nv; i++) {
                lineYArray.push(width * i);
            }
            for (var i = 1; i < nh; i++) {
                lineXArray.push(height * i);
            }

            var source = filename;
            fs.mkdirSync('./after-img/' + random + '/');

            imageToSlices(source, lineXArray, lineYArray, {
                saveToDir: './after-img/' + random + '/' //***
                //  saveToDataUrl: true
            }, function (data) {
                //console.log(data)  
                const imagesArray = [];
                for (let i = 1; i <= nh * nv; i++) {
                    imagesArray.push('http://localhost:3000/images/' + random + '/section-' + i + '.png')
                }
                res.send({ images: imagesArray });
            });
        })
        .catch((err) => {
            console.error(err)
        })



})

app.get('/images/:dir/:image', function (req, res) {
    //res.sendFile("/before-img/image.png", { root: __dirname })
    res.sendFile("/after-img/" + req.params.dir + "/" + req.params.image, { root: __dirname })

});
app.listen(3000)