
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase,ref,get } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

 function main() {

    const firebaseConfig = {
        apiKey: "",
        authDomain: "climateapp-io.firebaseapp.com",
        projectId: "climateapp-io",
        storageBucket: "climateapp-io.appspot.com",
        messagingSenderId: "450823170033",
        appId: "",
        measurementId: "G-TGDSCV2HNS",
        databaseURL: "https://climateapp-io-default-rtdb.firebaseio.com/"
      };


    const inputValue = document.querySelector('input');
    const name = document.querySelector('.name');

    const owner_item = document.querySelector('.grid-item-owner');
    const parent_item = document.querySelector('.grid-item-parent');
    const manufacturer_item = document.querySelector('.grid-item-manufacturer');
    const developer_item = document.querySelector('.grid-item-developer');
    
    const owner_name = document.querySelector('.owner-name');
    const parent_name = document.querySelector('.parent-name');
    const manufacturer_name = document.querySelector('.manufacturer-name');
    const developer_name = document.querySelector('.developer-name');

    const desc = document.querySelector('.desc');
    
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const firebaseRef = ref(db, 'profile');
    
    get(firebaseRef).then((snapshot) => {
      if (snapshot.exists()) {
        //name.textContent = snapshot.val();
      } else {
       // console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

    inputValue.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const searchQuery = inputValue.value.trim();
            search(searchQuery).then(function(result) {
                owner_item.style.display = "none";
                parent_item.style.display = "none";
                manufacturer_item.style.display = "none";
                developer_item.style.display = "none";
                let nameval = result[0].parse.title;
                let pageid = result[0].parse.pageid;
                const wikitext = result[0].parse.wikitext["*"];
                const description = result[1].query.pages[pageid].extract;
                let descriptionshortened = description.substring(0,description.indexOf(". "));
                desc.textContent = descriptionshortened;

                name.textContent = nameval;
                if (developer(wikitext) !== "null") {
                    developer_item.style.display = "block";
                    developer_name.textContent =  developer(wikitext);
                }
                if (parent(wikitext) !== "null") {
                    console.log("rreeeeeeeee")
                    parent_item.style.display = "block";
                    parent_name.textContent = parent(wikitext);
                }
                if (ownership(wikitext) !== "null" ) {
                    owner_item.style.display = "block";
                    owner_name.textContent = ownership(wikitext);
                }
                if (manufacturer(wikitext) !== "null") {

                    manufacturer_item.style.display = "block";
                    manufacturer_name.textContent = manufacturer(wikitext);
                }
            }); 
        }
    });
}

function  parent(data){
    let read = true
    let parentdata = ""
    let datalength = data.length
    let parentindex = data.indexOf('parent')
    for (let x = (parentindex + 7); x <datalength; x++) {
        if (data[x] === "="){
            for (let y = x; y < datalength; y++) {
                if (data[y] === "]" || data[y] === "\n"){
                    read = false;
                    break;
                }
                if (read){
                    console.log(data[y])
                    parentdata += data[y]
                }
            }
            break;
        }else if (data[x] !== " "){
            parentdata="null"
            break;
        }
    }
    return parentdata.replaceAll("[","").replaceAll("]","").replaceAll("=","")
}

function  ownership(data){
    let read = true
    let ownerdata = ""
    let datalength = data.length
    let ownerindex = data.indexOf('currentowner')
    for (let x = (ownerindex + 12); x <datalength; x++) {
        if (data[x] === "="){
            for (let y = x; y < datalength; y++) {
                if (data[y] === "]" || data[y] === "\n"){
                    read = false;
                    break;
                }
                if (read){
                    ownerdata += data[y]
                }
            }
            break;
        }else if (data[x] !== " "){
            ownerdata="null"
            break;
        }
    }
    return ownerdata.replaceAll("[","").replaceAll("]","").replaceAll("=","")
}

function  manufacturer(data){
    let read = true
    let manufacturerdata = ""
    let datalength = data.length
    let manufacturerindex = data.indexOf('manufacturer')
    for (let x = (manufacturerindex + 12); x <datalength; x++) {
        if (data[x] === "="){
            for (let y = x; y < datalength; y++) {
                if (data[y] === "]" || data[y] === "\n"){
                    read = false;
                    break;
                }
                if (read){
                    manufacturerdata += data[y]
                }
            }
            break;
        }else if (data[x] !== " "){
            manufacturerdata = "null"
            break;
        }
    }
    return manufacturerdata.replaceAll("[","").replaceAll("]","").replaceAll("=","")
}

function  developer(data){
    let read = true
    let developerdata = ""
    let datalength = data.length
    let developerindex = data.indexOf('developer')
    for (let x = (developerindex + 9); x <datalength; x++) {
        if (data[x] === "="){
            for (let y = x; y < datalength; y++) {
                if (data[y] === "]" || data[y] === "\n"){
                    read = false;
                    break;
                }
                if (read){
                    developerdata += data[y]
                }
            }
            break;
        }else if (data[x] !== " "){
            developerdata = "null"
            break;
        }
    }
    return developerdata.replaceAll("[","").replaceAll("]","").replaceAll("=","")
}

async function search(searchQuery) {
    try { 
        const results = await searchWikipediaForTitle(searchQuery);
        if (results.query.searchinfo.totalhits === 0) {
            alert('No results found. Try different keywords');
            return;
        }
        const wikidata = [];
        wikidata[0] = await searchWikipediaForWikitext(results.query.search[0].title);
        wikidata[1] = await searchWikipediaForDesc(results.query.search[0].title);
        return wikidata;
      } catch (err) {
        alert(err);
        alert('Failed to search wikipedia');
      }

}

async function searchWikipediaForDesc(searchQuery) {
    const endpoint = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=" + searchQuery + "&origin=*";
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw Error(response.statusText);
    }

    const json = await response.json();

    return json;
}

async function searchWikipediaForTitle(searchQuery) {
    const endpoint = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="+searchQuery+"(company)&srlimit=1&utf8=&format=json&origin=*";
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw Error(response.statusText);
    }

    const json = await response.json();

    return json;
}
  
async function searchWikipediaForWikitext(searchQuery) {
    const endpoint = "https://en.wikipedia.org/w/api.php?action=parse&page="+searchQuery+"&prop=wikitext&format=json&origin=*";
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    return json;
}
  
main()
  

  
