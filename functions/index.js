
// ################## SETUP DI COSTANTI E ACCESSO DB ################################################################
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const {
  dialogflow,
  HtmlResponse,
  BasicCard,
  SimpleResponse,
  Image,
  BrowseCarousel,
  BrowseCarouselItem,
  Suggestions,
  LinkOutSuggestion,
  List,
  Button
} = require('actions-on-google');
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const app = dialogflow({
  debug: true
});
const projectId = 'smemo-devi-funzionare';
const sessionId = SESSION_ID;
const query = 'ciao';
const languageCode = 'it';
const dialog = require('dialogflow');
let privateKey = PRIVATE_KEY;
let clientEmail = "client-access@smemo-devi-funzionare.iam.gserviceaccount.com";
let config = {
  credentials: {
    private_key: privateKey,
    client_email: clientEmail
  }
}
const sessionClient = new dialog.SessionsClient(config);
const sessionPath = sessionClient.sessionPath(projectId, sessionId);
const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: query,
      languageCode: languageCode,
    },
  },
};

const client = new dialog.IntentsClient();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://smemo-devi-funzionare.firebaseio.com/'
});

const db = admin.firestore();


// ################## INIZIO INTENTI ################################################################

app.intent('Default Welcome Intent', conv => {
    return  admin.database().ref('data').once('value').then((snapshot) => {
      const name = snapshot.child('userName').val();
      const sex = snapshot.child('sesso').val();
      const coloreRobot = snapshot.child('coloreRobot').val();
      const sfondo = snapshot.child('sfondo').val();
      const newUser = snapshot.child('newUser').val();
      if (newUser == false) {
        // non è un nuovo user quindi lo porto alla home
        if (name != ""){
          if (sex == 'maschio'){
            conv.ask(`Bentornato ${name}!`);
          }
          else conv.ask(`Bentornata ${name}!`);
        }
        else conv.ask(`Ciao!`);
        conv.ask(new HtmlResponse({
          url: `https://${firebaseConfig.projectId}.firebaseapp.com/`,
          data: {
            scene: 'home',
            sfondo: `${sfondo}`,
            coloreRobot: `${coloreRobot}`,
          }
        }));
      }
      else {
        // è un nuovo user, quindi gli mostro come prima cosa la storia di Smemo
        conv.ask(new HtmlResponse({
          url: `https://${firebaseConfig.projectId}.firebaseapp.com/`,
          data: {
            scene: 'laMiaStoria',
          }
        }));
        return admin.database().ref('data/newUser').set(false);
      }
    });
});

app.intent('Default Fallback Intent', conv => {
  return admin.database().ref('data').once('value').then((snapshot) => {
    const value = snapshot.child('userName').val();
    if (value != null){
      conv.ask(`Non ho capito ${value}, puoi ripetere?`);
    }
    else conv.ask(`Non ho capito, puoi ripetere?`);
    conv.ask(new HtmlResponse({
      data: {
        scene: 'defaultPage',
      }
    }));
  });
});


app.intent('Tutorial-home', conv => {
  // mostro il tutorial per la home
  return admin.database().ref('data').once('value').then((snapshot) => {
      const value = snapshot.child('userName').val();
      if (value != null){
        conv.ask(`${value}, adesso ti aiuto io`);
      }
      else conv.ask(`Adesso ti aiuto io`);
    conv.ask(new HtmlResponse({
      data: {
        scene: 'tutorial-home',
      }
    }));
  });
});


app.intent('chiudiTutorial-home', conv => {
  // chiude il tutorial per la sezione "home"
  conv.ask(new HtmlResponse({
    data: {
      scene: 'home',
    }
  }));
});


app.intent('la mia storia', conv => {
  // mostro la sotia di Smemo
    conv.ask(new HtmlResponse({
      data: {
        scene: 'laMiaStoria',
      }
    }));
});


app.intent('esci dalla mia storia', conv => {
  // esce dalla storia di Smemo
    conv.ask(new HtmlResponse({
      data: {
        scene: 'home',
      }
    }));
});

// INIZIO FLOW PER INSEGNARE INTENTI

app.intent('Tutorial-insegnare', conv => {
  // mostro il tutorial per la sezione "insegnare"
  return admin.database().ref('data').once('value').then((snapshot) => {
      const value = snapshot.child('userName').val();
      if (value != null){
        conv.ask(`${value}, ti aiuto io a insegnarmi qualcosa`);
      }
      else conv.ask(`Ti aiuto io ad insegnarmi qualcosa`);
    conv.ask(new HtmlResponse({
      data: {
        scene: 'tutorial-insegnare',
      }
    }));
  });
});


app.intent('chiudiTutorial-insegnare', conv => {
  // chiude il tutorial per la sezione "insegnare"
  conv.contexts.set('Contesto', 1);
  conv.ask('Ora dimmi la categoria');
  conv.ask(new HtmlResponse({
    data: {
      scene: 'insegnami',
    }
  }));
});


app.intent('Insegnare(1)', conv => {
  conv.ask('Ok! In quale categoria vuoi insegnarmi ?');
  const parameters = {
  };
  conv.contexts.set('Contesto', 1, parameters);
  conv.ask(new HtmlResponse({
    data: {
      scene: 'insegnami',
    }
  }));
});

app.intent('Contesto(2-new)', conv => {
  // salvo il contesto e chiedo a quale domanda deve rispondere
  conv.ask(`A quale domanda devo rispondere ?`);
  var contestoDatoDaUser = conv.input.raw;
  const parameters = {
    contestoDaUser: contestoDatoDaUser,
  };
  conv.contexts.set('Domanda', 1, parameters);
  conv.ask(new HtmlResponse({
    data: {
      scene: 'domanda',
    }
  }));
});


app.intent('Domanda(3)', conv => {
  // salvo la domanda e chiedo che risposta deve dare
  conv.ask('Che risposta devo dare ?');
  var contestoDatoDaUser = conv.contexts.input.domanda.parameters.contestoDaUser;
  const parameters = {
     contestoDatoDaUser: contestoDatoDaUser, domandaDatoDaUser: conv.input.raw
  };
  conv.contexts.set('Risposta', 1, parameters);
  conv.ask(new HtmlResponse({
    data: {
      scene: 'risposta',
    }
  }));
});


app.intent('Risposta(4)', conv => {
  return  admin.database().ref('data').once('value').then((snapshot) => {
    const sex = snapshot.child('sesso').val();
    const name = snapshot.child('userName').val();
    // ho tutti iparametri quindi chiamo funzione per creare l'intento e chiedo se vuole insegnare altro
    var contestoDatoDaUser = conv.contexts.input.risposta.parameters.contestoDatoDaUser;
    var domandaDatoDaUser = conv.contexts.input.risposta.parameters.domandaDatoDaUser;
    const parameters = {
       contestoDatoDaUser: contestoDatoDaUser
    };
    conv.ask(new HtmlResponse({
      data: {
        scene: 'continua',
      }
    }));
    CreateIntent(contestoDatoDaUser, domandaDatoDaUser, conv.input.raw);
    db.collection('intents').add({
      contesto: `${contestoDatoDaUser}`,
      domanda: `${domandaDatoDaUser}`,
      risposta: `${conv.input.raw}`
    });
    if (sex == 'maschio'){
      const ssml = '<speak>' +
      `<emphasis level="high">Bravissimo ${name}!</emphasis> ho imparato qualcosa di nuovo. <break time="0.3s" />. ` +
      `Se vuoi creare altro in questa categoria dimmi: <emphasis level="high"> ${contestoDatoDaUser} </emphasis>" <break time="0.4s" />.` +
      'Altrimenti dimmi: <emphasis level="high"> ho finito </emphasis> <break time="0.1s" />.' +
      '</speak>';
      conv.ask(ssml);
    }
    else {
      const ssml = '<speak>' +
      `<emphasis level="high">Bravissima ${name}!</emphasis> ho imparato qualcosa di nuovo. <break time="0.3s" />. ` +
      `Se vuoi creare altro in questa categoria dimmi: <emphasis level="high"> ${contestoDatoDaUser} </emphasis>" <break time="0.4s" />.` +
      'Altrimenti dimmi: <emphasis level="high"> ho finito </emphasis> <break time="0.1s" />.' +
      '</speak>';
      conv.ask(ssml);
    }
    conv.contexts.set('LoopCreazioneIntento', 1, parameters);
  });
});

app.intent('Loop Creazione Intento', conv => {
  // se mi ha risposto con il nome della categoria dell'intento insegnato precedentemente allora vuole insegnarmi altro (Loop)
  if(conv.input.raw != conv.contexts.input.loopcreazioneintento.parameters.contestoDatoDaUser) {
    conv.ask(new HtmlResponse({
      data: {
        scene: 'newCard',
      }
    }));
  }
  else {
    conv.ask(`a quale domanda devo rispondere ?`);
    const parameters = {
      contestoDaUser: conv.input.raw,
    };
    conv.contexts.set('Domanda', 1, parameters);
    conv.ask(new HtmlResponse({
      data: {
        scene: 'domanda',
      }
    }));
  }
});

//################# INTENTI DELLE IMPOSTAZIONI
app.intent('vai alle impostazioni', conv => {
  conv.ask(new HtmlResponse({
    data: {
      scene: 'impostazioni',
    }
  }));
  const parameters = {
  };
  conv.contexts.set('impostazioni', 5, parameters);
  conv.ask(`Andiamo nelle impostazioni.`);
});


app.intent('CambioNome(1)', conv => {
  // vuole cambiare nome
  conv.ask(new HtmlResponse({
    data: {
      scene: 'impostazioni',
    }
  }));
  conv.ask(`come ti chiami ?`);
});

app.intent('CambioNome(2)', conv => {
  // acquisisco il nuovo nome e lo salvo nel DB
  conv.ask(new HtmlResponse({
    data: {
      scene: 'impostazioni',
    }
  }));
  const name = conv.parameters.name;
  conv.ask(`Che bello, da ora ti chiamerò ${name}`);
  return admin.database().ref('data/userName').set(name);
});


app.intent('CambioSesso', conv => {
  // acquisisco il nuovo sesso e lo salvo nel DB
  conv.ask(new HtmlResponse({
    data: {
      scene: 'impostazioni',
    }
  }));
  const sesso = conv.parameters.sesso;
  conv.ask(`Perfetto`);
  return admin.database().ref('data/sesso').set(sesso);
});


app.intent('CambioSfondo', conv => {
  // vuole cambiare sfondo
  conv.ask(new HtmlResponse({
    data: {
      scene: 'sfondi',
    }
  }));
  conv.ask(`scegli lo sfondo che ti piace`);
});


app.intent('CambioColoreRobot', conv => {
  // vuole cambiare il colore del robot
  conv.ask(new HtmlResponse({
    data: {
      scene: 'robotColor',
    }
  }));
  conv.ask(`cambia il mio colore`);
});


app.intent('CambioColoreRobot-blue', conv => {
  // salvo nel DB il nuovo colore: blu
  conv.ask(new HtmlResponse({
    data: {
      scene: 'robotBlu',
    }
  }));
  const color = "robotBlu";
  conv.ask(`cucù ! ora sono blu`);
  return admin.database().ref('data/coloreRobot').set(color);
});


app.intent('CambioColoreRobot-verde', conv => {
  // salvo nel DB il nuovo colore: verde
  conv.ask(new HtmlResponse({
    data: {
      scene: 'robotVerde',
    }
  }));
  const color = "robotVerde";
  conv.ask(`sono verde come un avocado`);
  return admin.database().ref('data/coloreRobot').set(color);
});

app.intent('CambioColoreRobot-viola', conv => {
  // salvo nel DB il nuovo colore: viola
  conv.ask(new HtmlResponse({
    data: {
      scene: 'robotViola',
    }
  }));
  const color = "robotViola";
  conv.ask(`sono viola come il fiore`);
  return admin.database().ref('data/coloreRobot').set(color);
});


app.intent('CambioSfondo-dinosauri', conv => {
  // salvo nel DB il nuovo sfondo: dinosauri
  conv.ask(new HtmlResponse({
    data: {
      scene: 'dinosauri',
    }
  }));
  const sfondo = "dinosauri";
  conv.ask(`allora non si sono estinti !`);
  return admin.database().ref('data/sfondo').set(sfondo);
});


app.intent('CambioSfondo-caramelle', conv => {
  // salvo nel DB il nuovo sfondo: caramelle
  conv.ask(new HtmlResponse({
    data: {
      scene: 'caramelle',
    }
  }));
  const sfondo = "caramelle";
  conv.ask(`mmmmmmm che buone`);
  return admin.database().ref('data/sfondo').set(sfondo);
});


app.intent('CambioSfondo-spazio', conv => {
  // salvo nel DB il nuovo sfondo: spazio
  conv.ask(new HtmlResponse({
    data: {
      scene: 'spazio',
    }
  }));
  const sfondo = "spazio";
  conv.ask(`houston abbiamo un problema`);
  return admin.database().ref('data/sfondo').set(sfondo);
});


app.intent('CambioSfondo-bianco', conv => {
  // salvo nel DB il nuovo sfondo: bianco
  conv.ask(new HtmlResponse({
    data: {
      scene: 'bianco',
    }
  }));
  const sfondo = "bianco";
  conv.ask(`bello e semplice`);
  return admin.database().ref('data/sfondo').set(sfondo);
});


app.intent('Tutorial-impostazioni', conv => {
  // mostro tutorial per le impostazioni
  return admin.database().ref('data').once('value').then((snapshot) => {
      const value = snapshot.child('userName').val();
      if (value != null){
        conv.ask(`${value}, ti guido io`);
      }
      else conv.ask(`Ti guido io`);
    conv.ask(new HtmlResponse({
      data: {
        scene: 'tutorial-impostazioni',
      }
    }));
  });
});


app.intent('chiudiTutorial-impostazioni', conv => {
  // chiude il tutorial per la sezione "impostazioni"
  conv.contexts.set('impostazioni', 1);
  conv.ask(new HtmlResponse({
    data: {
      scene: 'impostazioni',
    }
  }));
});

//################# INTENTI PER TORNARE ALLA HOME
app.intent('vai alla Home', conv => {
  // intento per tornare alla home partendo da una pagina all'interno della web application
  conv.ask('Ti porto alla schermata iniziale');
  conv.ask(new HtmlResponse({
    data: {
      scene: 'home',
    }
  }));
});


app.intent('vai alla Home 2', conv => {
  // intento per tornare alla home partendo da una pagina fuori dalla web application
  return  admin.database().ref('data').once('value').then((snapshot) => {
    conv.ask('Andiamo alla schermata iniziale');
    const coloreRobot = snapshot.child('coloreRobot').val();
    const sfondo = snapshot.child('sfondo').val();
  	conv.ask(new HtmlResponse({
          url: `https://${firebaseConfig.projectId}.firebaseapp.com/`,
          data: {
            scene: 'home',
            sfondo: `${sfondo}`,
            coloreRobot: `${coloreRobot}`,
          }
    }));
  });
});


//################# INTENTI PER LA SEZIONE 'CHIEDIMI'
app.intent('Chiedimi', conv => {
  const parameters = {
  };
  conv.contexts.set('chiedimi', 5, parameters);
  conv.ask(`Perfetto, ora chiedimi quello che mi hai insegnato.`);
});

app.intent('Fallback Chiedimi', conv => {
  return admin.database().ref('data').once('value').then((snapshot) => {
    const value = snapshot.child('userName').val();
    if (value != null){
      conv.ask(`Non ho capito ${value}, puoi ripetere?`);
    }
    else conv.ask(`Non ho capito, puoi ripetere?`);
  });
});

//################# INTENTI DELLA SEZIONE CARDS

const createList = conv => {
  // const per la creazione di una lista di items
  items = conv.user.storage.items;
  conv.ask(new List({
    title: 'Le tue Cards',
    items: items,
  }));
  // SUGGESTION
  conv.ask(new Suggestions('esci dalla lista'));
}

const createSingleList = conv => {
  // const per la creazione di una lista che contiene un solo item
  itemTitle = conv.user.storage.domanda;
  itemText = conv.user.storage.risposta;
  itemContext = conv.user.storage.contesto;
  conv.ask(new SimpleResponse({
        speech: "Ecco qui la card per questa categoria",
        text: "Ecco qui la card per questa categoria",
    }))
  conv.ask(new BasicCard({
   text: `${itemText}  \n`,
   subtitle: ' ',
   title: `${itemTitle}`,
   image: new Image({
     url: `${cardImage(itemContext)}`,
     alt: 'Image alternate text',
   }),
   display: 'CROPPED',
 }));
  // SUGGESTION
  conv.ask(new Suggestions('esci dalla lista'));
  conv.ask(new Suggestions('elimina questa card'));
}

const createSingleListForContext = conv => {
  // per la creazione di una lista che contiene un solo item di tipo categoria
  itemContext = conv.user.storage.contesto;
  console.log(itemContext);
  console.log(cardImage(itemContext));
  conv.ask(new SimpleResponse({
        speech: "Ecco qui la categoria che hai creato",
        text: "Ecco qui la categoria che hai creato",
    }));
  conv.ask(new BasicCard({
   text: `${itemContext}  \n`,
   subtitle: ' ',
   title: 'La tua categoria',
   image: new Image({
     url: `${cardImage(itemContext)}`,
     alt: 'Image alternate text',
   }),
   display: 'CROPPED',
 }));
  // SUGGESTION
  conv.ask(new Suggestions('esci dalla lista'));
  conv.ask(new Suggestions('visualizza categoria'));
}


app.intent('Cards', (conv) => {
  // intento che mostra la lista di contesti creati dall'utente
  if (!conv.screen) {
      conv.ask('Mi dispiace ma questo dispositivo non supporta un interfaccia grafica.');
      return;
    }
  const parameters = {
  };
  conv.contexts.set('cards', 1, parameters);
  var items = {};
  // la lista degli intenti viene presa dal cloud storage di Firebase (lista di intenti da mostrare all'utente creata ad hoc, i.e senza
  // tutti gli intenti per far funzionare l'agente che non interessano l'utente)
  return db.collection('intents').get()
  .then(intents => {
    let mySet = new Set();
    intents.forEach(intent => {
      // aggiungo al set tutti i nomi dei contesti (senza duplicati)
      mySet.add(`${intent.get('contesto')}`);
      // salvo i parametri dell'intento
      conv.user.storage.contesto = intent.get('contesto');
      conv.user.storage.risposta = intent.get('risposta');
      conv.user.storage.domanda = intent.get('domanda');
    });
    for (let x of mySet) {
      var k = `${x}`;
      items[k] = {
              synonyms: [
                `${k}`,
              ],
              title: `${k}`,
              description: ` `,
              image: new Image({
                url: `${cardImage(k)}`,
                alt: 'Image alternate text',
              }),
            };
    }
    if (mySet.size >= 2) {
      // se la lista è formata da un numero maggiore di 2 elementi creo una lista normale di items
      conv.user.storage.items = items;
      createList(conv);
      conv.ask('queste sono le categorie che hai creato');
    }
    else {
      // se la lista da creare ha meno di due elementi non posso creare una lista normale di items (limitazione di Google)
      if (mySet.size = 1) {
        createSingleListForContext(conv);
      }
      else {
        conv.ask('Mi spiace ma non hai ancora delle Cards, vai alla sezione impariamo e insegnami qualcosa');
      }
    }
    }).catch(err => {
      console.error(err);
    });
});

app.intent('Cards(2)', (conv) => {
  // intento che mostra gli intenti creati per il contesto selezionato dall'utente
  if (!conv.screen) {
      conv.ask('Mi dispiace ma questo dispositivo non supporta un interfaccia grafica.');
      return;
    }
  const parameters = {
  };

  var items = {};
  // la lista degli intenti viene presa dal cloud storage di Firebase (lista di intenti da mostrare all'utente creata ad hoc, i.e senza
  // tutti gli intenti per far funzionare l'agente che non interessano l'utente)
  return db.collection('intents').get()
  .then(intents => {
      var i = 0;
      intents.forEach(intent => {
        // tengo solo gli intenti che hanno come contesto quello selezionato dall'utente
        if (( conv.input.raw == intent.get('contesto')&&conv.input.raw!='visualizza categoria' || conv.user.storage.contesto == intent.get('contesto')&&conv.input.raw=='visualizza categoria')&& (i <= 28)){
          i = i + 1;
          var k = `${intent.get('domanda')}`;
            items[k] = {
                  synonyms: [
                  ],
                  title: `${intent.get('domanda')}`,

                  description: `${intent.get('risposta')}`,
                  image: new Image({
                    url: `${cardImage(intent.get('contesto'))}`,
                    alt: 'Image alternate text',
                  }),
                };
          // salvo i parametri dell'intento
          conv.user.storage.risposta = intent.get('risposta');
          conv.user.storage.domanda = intent.get('domanda');
          conv.user.storage.contesto = intent.get('contesto');
          }
    });
    if ( i >= 2){
      // se la lista è formata da un numero maggiore di 2 elementi creo una lista normale di items
      conv.user.storage.items = items;
      createList(conv);
      conv.contexts.set('cards2', 1, parameters);
      conv.ask('Ecco qui le cards per questa categoria');
    }
    else {
      // se la lista da creare ha meno di due elementi non posso creare una lista normale di items (limitazione di Google)
      createSingleList(conv);
      conv.contexts.set('cards2', 1, parameters);
    }
    }).catch(err => {
      console.error(err);
    });
});

app.intent('Cards(3)', conv => {
  // intento per l'eliminazione dell'intento selezionato
  conv.ask('Vuoi eliminare la card selezionata ? rispondi "si" oppure "no" ');
  conv.user.storage.intento = `${conv.input.raw}`;
  const parameters = {
  };
  conv.contexts.set('eliminazioneIntento', 1, parameters);
});


app.intent('eliminazione intento si', conv => {
  // riposta affermativa per la cancellazione dell'intento
  return  admin.database().ref('data').once('value').then((snapshot) => {
    conv.ask('che peccato dimenticare quello che mi hai insegnato');
    var intento = conv.user.storage.intento;
    myDeleteIntent(intento);
    const coloreRobot = snapshot.child('coloreRobot').val();
    const sfondo = snapshot.child('sfondo').val();
    conv.ask(new HtmlResponse({
          url: `https://${firebaseConfig.projectId}.firebaseapp.com/`,
          data: {
            scene: 'home',
            sfondo: `${sfondo}`,
            coloreRobot: `${coloreRobot}`,
          }
        }));
    return db.collection('intents').get()
    .then(intents => {
      var strs = JSON.stringify(intents);
      console.log(`intents: ${strs}`);
      intents.forEach(intent => {
        if (intent.get('domanda').valueOf() == intento.valueOf()) {
          var id = intent.id ;
          db.collection('intents').doc(id).delete();
        }
      });
      }).catch(err => {
        console.error(err);
      });
    });
});

app.intent('eliminazione intento no', conv => {
  // risposta negativa per la cancellezione dell'intento
  return  admin.database().ref('data').once('value').then((snapshot) => {
    conv.ask('fiù, per un pelo');
    const coloreRobot = snapshot.child('coloreRobot').val();
    const sfondo = snapshot.child('sfondo').val();
    conv.ask(new HtmlResponse({
          url: `https://${firebaseConfig.projectId}.firebaseapp.com/`,
          data: {
            scene: 'home',
            sfondo: `${sfondo}`,
            coloreRobot: `${coloreRobot}`,
          }
        }));
  });
});


app.intent('elimina singola card', conv => {
  conv.ask('Vuoi eliminare la card selezionata ? rispondi "si" oppure "no"');
  conv.user.storage.intento = conv.user.storage.domanda;
  const parameters = {
  };
  conv.contexts.set('eliminazioneIntento', 1, parameters);
});


app.intent('esci dalla lista', conv => {
  // esce dalla lista delle categorie degli intenti
  return  admin.database().ref('data').once('value').then((snapshot) => {
    conv.ask('voliamo alla schermata iniziale');
    const coloreRobot = snapshot.child('coloreRobot').val();
    const sfondo = snapshot.child('sfondo').val();
  	conv.ask(new HtmlResponse({
          url: `https://${firebaseConfig.projectId}.firebaseapp.com/`,
          data: {
            scene: 'home',
            sfondo: `${sfondo}`,
            coloreRobot: `${coloreRobot}`,
          }
        }));
  });
});


app.intent('esci dalla lista 2', conv => {
  // esce dalla lista degli intenti per una specifica categoria
  return  admin.database().ref('data').once('value').then((snapshot) => {
    conv.ask('voliamo alla schermata iniziale');
    const coloreRobot = snapshot.child('coloreRobot').val();
    const sfondo = snapshot.child('sfondo').val();
    conv.ask(new HtmlResponse({
          url: `https://${firebaseConfig.projectId}.firebaseapp.com/`,
          data: {
            scene: 'home',
            sfondo: `${sfondo}`,
            coloreRobot: `${coloreRobot}`,
          }
        }));
    });
});



//############## FUNZIONI ###################################################################

// funzione per eliminare un intento (cioè una Card)
function myDeleteIntent(intento) {
  const formattedParent = client.projectAgentPath('smemo-devi-funzionare');
  client.listIntents({parent: formattedParent}, {autoPaginate: false})
    .then(responses => {
      const resources = responses[0];
      for (const resource of resources) {
        if (resource.displayName == intento) {
          const formattedName = resource.name;
          console.log(`formatted name: ${formattedName}`);
          client.deleteIntent({name: formattedName}).catch(err => {
          console.error(err);
        });
        }
      }
    })
    .catch(err => {
      console.error(err);
    });
}


// funzione per creare nuovi Intents
function CreateIntent(contestoDatoDaUser, domandaDatoDaUser, rispostaDatoDaUser){
const formattedParent = client.projectAgentPath('smemo-devi-funzionare');
// oggetto intento
const intent = {
  "displayName": String(domandaDatoDaUser),
  "inputContextNames": [
    "projects/smemo-devi-funzionare/agent/sessions/-/contexts/chiedimi"
  ],
  "trainingPhrases": [
    {
      "type": "TYPE_UNSPECIFIED",
      "parts": [
        {
          "text": String(domandaDatoDaUser)
        }
      ],
      "timesAddedCount": 0
    }
  ],
  "outputContexts": [
    {
      "name": "projects/smemo-devi-funzionare/agent/sessions/-/contexts/chiedimi",
      "lifespanCount": 1,
    }
  ],
  "parameters": [
    {
      "displayName": "categoria",
      "value": String(contestoDatoDaUser)
    }
  ],
  "messages": [
    {
      "text": {
        "text": [
          rispostaDatoDaUser
        ]
      }
    }
    ]};
const req = {
  parent: formattedParent,
  intent: intent,
};
// metodo createIntent() di Google
client.createIntent(req)
.then(responses => {
const response = responses[0];
})
.catch(err => {
console.error(err);
});
}


// funzione per la classificazione delle immagini
function cardImage(contesto){
  var urlImage;
  switch (contesto) {
    case "mate":
    case "matematica":
    case "tabelline":
    case "tabellina":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/matematica.svg?alt=media&token=4bb6fc3b-3264-418c-bbe0-55142f4acd22';
      break;
    case 'Mucca':
    case 'Giraffa':
    case 'Cane':
    case 'Maiale':
    case "animali":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/animali.svg?alt=media&token=86ca9ff7-5b29-4389-818f-8fb12841f7d8';
      break;
    case "barzellette":
    case "barzelletta":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/jokes.svg?alt=media&token=e7cd1ffe-4845-4674-a9d0-807b7499eea8';
      break;
    case "caramelle":
    case "caramella":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/caramelle.svg?alt=media&token=da34095a-3f5a-4ab5-a3e5-5798908d61c3';
      break;
    case "stelle":
    case "stella":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/stelle.svg?alt=media&token=32d42472-1733-49c3-9db6-343178947605';
      break;
    case "storia":
    case "anitichità":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/storia.svg?alt=media&token=2d518861-def8-40e7-9f1c-38a7b72a2fe0';
      break;
    case "terra":
    case "pianeta":
    case "geografia":
    case "capitali":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/terra.svg?alt=media&token=c41ac194-db5e-4b07-ae57-956e3a49c928';
      break;
    case "viaggi":
    case "aereo":
    case "aerei":
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/viaggi.svg?alt=media&token=2edfbb76-f29c-42bc-a3f5-ff307fc661b8';
      break;
    default:
      urlImage = 'https://firebasestorage.googleapis.com/v0/b/smemo-devi-funzionare.appspot.com/o/noCtegoryMatched.svg?alt=media&token=e29da6b0-5e4e-4f37-96c6-00100f1eac17';
      break;
  }
  return urlImage
}

exports.fulfillment = functions.https.onRequest(app);
