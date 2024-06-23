const express = require("express");
const fs= require('fs');
const path=require('path');
const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');


obGlobal ={
    obErori:null,
    obImagini:null
}

vect_foldere=["temp", "temp1"]
for(let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
        
}


app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

app.set("view engine","ejs");

app.use("/resurse", express.static(__dirname+"/resurse"));

/*
trimiterea unui mesaj fix
trimiterea unui mesaj dinamic
trimiterea unui mesaj dinamic in functie de parametri (req.params; req.query)
ce face /* si ordinea app.get-urilor.
*/

//trimiterea unui mesaj fix
app.get("/cerere", function(req, res){
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");
});


//trimiterea unui mesaj dinamic
app.get("/data", function(req, res, next){
    res.write("Data:");
    next();
});

app.get("/data", function(req, res){
    res.write(""+new Date());
    res.end();
});

//trimiterea unui mesaj dinamic in functie de parametri (req.params; req.query)
//ce face /* si ordinea app.get-urilor.*/
app.get("/suma/:a/:b", function(req, res){
    var suma=parseInt(req.params.a)+parseInt(req.params.b)
    res.send(""+suma);
});

app.get(["/", "/home", "/index"], function(req,res){
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini});
});




app.get("/*.ejs", function(req, res){
    afisareEroare(res,400);
});


app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/favicon/favicon.ico"));
});



app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function(req, res){
    afisareEroare(res,403);
});



app.get("/*", function(req, res){
    //console.log(req.url)
    try {
        res.render("pagini"+req.url, function(err, rezHtml){
            //console.log(rezHtml);
            //console.log("Eroare:"+err)

            if(err){
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res,404);
                    console.log("Nu a gasit pagina", req.url)
                }
            }
        });
    }

    catch(err1){
        if (err1.message.startsWith("Cannot find module")){
             afisareEroare(res,404);
            console.log("Nu a gasit resursa", req.url)
        }
        else{
            afisareEroare(res);
            console.log("Eroare:"+err)
        }
    }

})  

function initErori(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    console.log(continut);
    
    obGlobal.obErori=JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza,eroare.imagine)
    }
    console.log(obGlobal.obErori);

} 
initErori()


function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare=obGlobal.obErori.info_erori.find(
        function(elem){
            return elem.identificator==_identificator
        }
    )
    if(!eroare){
        let eroare_default=obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine,
        })
        return;
    }
    else{
        if(eroare.status)
            res.status(eroare.identificator)

        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine,
        })
        return;
    }
}


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
        
    }
}
initImagini();



app.listen(8080);
console.log("Serverul a pornit");