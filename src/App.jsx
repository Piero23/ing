//Import Estetica
import './App.css'; // Assicurati che il percorso sia corretto

//react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

//FontAwasome
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEraser, faPen, faUndo, faRedo} from "@fortawesome/free-solid-svg-icons";

// React-ui-kit
import {MDBCard, MDBCardBody, MDBCol, MDBContainer, MDBRow,} from 'mdb-react-ui-kit';

//Import Funzionalità e Database e Auth
import {useEffect, useRef, useState} from 'react';
import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth"
import {useAuthState} from "react-firebase-hooks/auth";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    where
} from "firebase/firestore";

//uid
import {v4 as uuidv4} from 'uuid';

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB6KJjG0HiFU9-_8g3O08HPsQu2UsCS3jc",
    authDomain: "drawfirends.firebaseapp.com",
    projectId: "drawfirends",
    storageBucket: "drawfirends.firebasestorage.app",
    messagingSenderId: "721252790199",
    appId: "1:721252790199:web:99776e49c8cd5228f8c232",
    measurementId: "G-Q9JZEVESPJ"
};

//Funzioni di Auth e Database
/**
 * @param {string}customIdValue
 * @param {string}name
 * @returns {Promise<void>}
 */
const removeValueFromDB = async (customIdValue, name) => {
    try {
        // Query per trovare il documento con il customId specificato
        const colRef = collection(db, name);
        const q = query(colRef, where("id", "==", customIdValue));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`Nessun documento trovato con customId = ${customIdValue}`);
            return;
        }
        // Elimina ogni documento corrispondente (nel caso ci siano più risultati)
        const deletePromises = querySnapshot.docs.map((docSnapshot) =>
            deleteDoc(doc(db, name, docSnapshot.id))
        );

        await Promise.all(deletePromises);
        console.log(`Documenti con customId = ${customIdValue} eliminati con successo.`);
    } catch (error) {
        console.error("Errore durante l'eliminazione dei documenti:", error);
    }
};

/**
 * @param {string}collectionName
 * @param {any}value
 * @returns {Promise<void>}
 */
const addValueToDB = async (collectionName, value) => {
    await addDoc(collection(db, collectionName), value);
}


/**
 * @typedef {{id : any, userId : string, strokeStyle: string, lineWidth: number, points: [{x : number, y: number}], createdAt: string}}Stroke
 */


/**
 * @typedef {{id : any, username:string}}User
 */

//Classi Pattern Memento


//Originator
class YourListOfStrokes {
    /**
     * @param {Stroke[]}content
     */
    constructor(content = []) {
        this.content = content;
    }

    createMemento() {
        return new YourListOfStrokesMemento(this.content);
    }

    /**
     * @param {YourListOfStrokesMemento}memento
     * @param {boolean}undo
     */
    restoreFromMemento(memento, undo) {

        this.content = memento.getContent();
        const inspectiondContent = this.content[this.content.length - 1];
        console.log(inspectiondContent);

        if (undo)
            removeValueFromDB(inspectiondContent.id, "strokes");// Ripristina il contenuto dal Memento
        else
            addValueToDB("strokes", inspectiondContent);

    }

    getContent() {
        return this.content;
    }
}

//Memento
class YourListOfStrokesMemento {
    /**
     * @param {Stroke[]}content
     */
    constructor(content) {
        this.content = structuredClone(content);
    }

    getContent() {
        return this.content;
    }
}


//Caretaker
class ActionManager {

    /**
     * @type {YourListOfStrokesMemento[]}
     */
    history = []
    /**
     * @type {YourListOfStrokesMemento[]}
     */
    removedHistory = []

    /**
     * @param {YourListOfStrokes}stroke
     */
    do(stroke) {
        this.history.push(stroke.createMemento())
        this.removedHistory = []
    }

    undo() {
        if (this.history.length === 0) return null;

        const undid = this.history.pop()
        // @ts-ignore
        this.removedHistory.push(undid)
        return undid
    }


    redo() {
        if (this.removedHistory.length === 0) return null;

        const redid = this.removedHistory.pop()
        // @ts-ignore
        this.history.push(redid)
        return redid
    }


    getLastUndo() {
        if (this.history.length === 0) return null;
        return this.history[this.history.length - 1];
    }

    getLastRedo(){
        if(this.removedHistory.length === 0) return null;
        return this.removedHistory[this.removedHistory.length - 1];
    }

}


//Inizio App React
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)

function App() {

    //Variabile per il LgoinU
    const [user] = useAuthState(auth)

    return (
        <div className="App">
            <header className="App-header"></header>
            <main>
                { user ? <DrawingApp userId={user}/> : <SignIn />}
            </main>
        </div>
    );
}


//Login
function SignIn() {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider(); // Crea il provider Google
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Accesso riuscito! Utente:", user);
        } catch (error) {
            console.error("Errore durante l'accesso con Google:", error);
        }
    };

    return (
        <MDBContainer fluid className='d-flex justify-content-center align-items-center mt-5 p-5'>
            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>

                    <MDBCard className='bg-dark text-white my-5 mx-auto'
                             style={{borderRadius: '1rem', maxWidth: '400px'}}>
                        <MDBCardBody className='p-5 d-flex flex-column align-items-center mx-auto w-100'>

                            <h3 className="fw-bold mb-2 ">Login to Draw.firends</h3>
                            <p className="text-white-50 mb-5">Singin in is only possibile with Google</p>

                            <Button onClick={() => signInWithGoogle()}
                                    className='mx-2 px-5 d-flex justify-content-center align-items-center'
                                    style={{gap: "5px"}} color='white' size='lg'>
                                <img
                                    src={"https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"}
                                    style={{width: "30px"}} alt={"Google Logo"}/>
                                Login
                            </Button>

                            <div className='d-flex flex-row mt-3 mb-5'>
                            </div>

                            <div>
                                <h4>what is Draw.friends?</h4>
                                <p className="mb-0">Draw.firends is an online website where your and everyone who has
                                    access to this site can reunite and draw together! <br/> at the moment is only
                                    usable via PC </p>
                            </div>
                        </MDBCardBody>
                    </MDBCard>

                </MDBCol>
            </MDBRow>

        </MDBContainer>
    );
}


//Canvas
const DrawingApp = ({userId}) => {

    //Ref
    /**
     * @type {React.RefObject<null|HTMLCanvasElement>}
     */
    const canvasRef = useRef(null);
    /**
     * @type {React.RefObject<null|CanvasRenderingContext2D>}
     */
    const contextRef = useRef(null);
    const yourListOfStrokes = useRef(new YourListOfStrokes([])); // Solo stroke dell'utente per gli Undo/Redo
    const currentWritingStroke = useRef(new YourListOfStrokes([])); // Stroke corrente per la visualizzazione in tempo reale
    /**
     * @type {React.RefObject<Stroke[]>}
     */
    const globalStrokes = useRef([]); // Stroke globali caricati dal database
    const actionManager = useRef(new ActionManager());

    //State
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeStyle, setStrokeStyle] = useState("black");
    const [lineWidth, setLineWidth] = useState(5);
    const [isErasing, setIsErasing] = useState(false);
    const [isUndoImpossible, setIsUndoImpossible] = useState(true);
    const [isRedoImpossible, setIsRedoImpossible] = useState(true);



    // Disegna sia gli stroke globali che quelli locali
    const redraw = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;

        if (!context || !canvas) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        [...globalStrokes.current, ...currentWritingStroke.current.getContent()].forEach(
            ({strokeStyle, lineWidth, points}) => drawStroke(context, strokeStyle, lineWidth, points)
        );
    };

    // Carica gli stroke globali dal database
    useEffect(() => {
        const q = query(collection(db, "strokes"), orderBy("createdAt", "asc"));
        return onSnapshot(q, (snapshot) => {
            globalStrokes.current = snapshot.docs.map(
                /**
                 * @returns {any}
                 */
                (doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            redraw();
        });
    });

    // Configura il canvas
    useEffect(() => {
        const canvas = canvasRef.current;

        document.body.style.background = '#282828';

        if (!canvas) return;
        canvas.width = 3000;
        canvas.height = 1200;

        const context = canvas.getContext("2d");
        if (!context) return;
        context.lineCap = "round";

        contextRef.current = context;

        redraw();
    });



    /**
     * @param context{CanvasRenderingContext2D}
     * @param strokeStyle{string}
     * @param lineWidth{number}
     * @param points{{x:number,y:number}[]}
     */
    //Usato per disegnare lo stroke corrente
    const drawStroke = (context, strokeStyle, lineWidth, points) => {
        context.strokeStyle = strokeStyle;
        context.lineWidth = lineWidth;
        context.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                context.moveTo(point.x, point.y);
            } else {
                context.lineTo(point.x, point.y);
            }
        });
        context.stroke();
    };

    /**@param event {{nativeEvent:MouseEvent}}*/
    // Inizio del disegno
    const startDrawing = ({nativeEvent}) => {

            const {offsetX, offsetY} = nativeEvent;
            /**
             * @type {Stroke}
             */
            const newStroke = {
                id: uuidv4(),
                userId : userId.displayName,
                strokeStyle: isErasing ? "white" : strokeStyle,
                lineWidth,
                points: [{x: offsetX, y: offsetY}],
                createdAt: new Date().toISOString(),
            };

            // Aggiungi a stroke lcali
            const strokesManagerInstance = yourListOfStrokes.current;
            strokesManagerInstance.content.push(newStroke);
            currentWritingStroke.current.content.push(newStroke)

            setIsDrawing(true);
        };

    // Fine del disegno
    const finishDrawing = async () => {
        setIsDrawing(false);

        const currentStroke = yourListOfStrokes.current.getContent()[yourListOfStrokes.current.getContent().length - 1];
        // Salva lo stato per undo
        actionManager.current.do(yourListOfStrokes.current);

        currentWritingStroke.current.content = []
        if (currentStroke) {
            try {
                addValueToDB("strokes", currentStroke)
            } catch (error) {
                console.error("Errore durante il salvataggio dello stroke:", error);
            }
        }
    };

    // Disegno in corso
    const draw = ({nativeEvent}) => {
        if (!isDrawing) return;
        const {offsetX, offsetY} = nativeEvent;
        const newPoint = {x: offsetX, y: offsetY};
        const currentStroke =
            yourListOfStrokes.current.getContent()[
            yourListOfStrokes.current.getContent().length - 1
                ];
        currentStroke.points.push(newPoint);
        setIsUndoImpossible(false)
        setIsRedoImpossible(true)

        redraw();
    };


    // Undo
    const undo = () => {
        const lastMemento = actionManager.current.undo();

        if (!actionManager.current.getLastUndo()) {
            setIsUndoImpossible(true)
            setIsRedoImpossible(false);
        }else
            setIsRedoImpossible(false);

        if (lastMemento) {
            const strokesManagerInstance = yourListOfStrokes.current;
            strokesManagerInstance.restoreFromMemento(lastMemento, true);
            redraw();
        } else {
            console.log("Nessuno stroke da annullare.");
        }
    };

    const redo = () => {
        const strokesManagerInstance = yourListOfStrokes.current;
        const lastMemento = actionManager.current.redo();

        if(!actionManager.current.getLastRedo()) {
            setIsRedoImpossible(true)
            setIsUndoImpossible(false)
        }else
            setIsUndoImpossible(false);

        if (lastMemento) {
            strokesManagerInstance.restoreFromMemento(lastMemento, false);
            redraw();
        } else
            console.log('Nessuno stroke da "deannullare"');
    };

    //CTRL+Z per UNDO
    useEffect(() => {
        /**
         * @param e {KeyboardEvent}
         */
        const undoShortcut = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                undo();
            }
        };
        window.addEventListener('keydown', undoShortcut);
        return () => {
            window.removeEventListener('keydown', undoShortcut);
        };
    });


    return (
        <>
            <Navbar bg="dark" data-bs-theme="dark" style={{
                width: "30vw",
                height: "5vh",
                position: "fixed",
                bottom: "1dvh",
                left: "50%",
                transform: "translateX(-50%)",
                borderRadius: "20dvw"
            }} className={"container-fluid d-flex justify-content-center align-items-center p-0"}>

                <Container className={"container-fluid w-25 d-flex justify-content-center align-items-center"}>
                    <Nav className="me-auto align-items-center d-flex" style={{gap: '1dvw', padding: "0 !important"}}>
                        <Button
                            id="tbg-pen"
                            className={`toolbarIcon ${!isErasing ? 'selected' : ''}`}
                            onClick={() => setIsErasing(false)}
                            value={"a"}
                        >
                            <FontAwesomeIcon style={{ width: "2vw", height: "2vh" }} icon={faPen} />
                        </Button>

                        <Button
                            id="tbg-eraser"
                            className={`toolbarIcon ${isErasing ? 'selected' : ''}`}
                            onClick={() => setIsErasing(true)}
                            value={"a"}
                        >
                            <FontAwesomeIcon style={{ width: "2vw", height: "2vh" }} icon={faEraser}/>
                        </Button>

                        <input type="color" value={strokeStyle}
                               onChange={(e) => setStrokeStyle(e.target.value)}  // Disabilita il cambio colore in modalità gomma className={"colorPicker"}
                        />

                        <input type="number" value={lineWidth} min="1" max="20" className={"toolbarIcon"}
                            onChange={(e) => {
                                const newValue = Math.min(Number(e.target.value), 2000);
                                setLineWidth(newValue);
                            }}
                        />

                        <Button onClick={undo} className={"toolbarIcon"} disabled={isUndoImpossible}>
                            <FontAwesomeIcon style={{width: "2vw", height: "2vh"}} icon={faUndo}/>
                        </Button>

                        <Button onClick={redo} id={"adsfa"} value={"fafs"} className={"toolbarIcon"} disabled={isRedoImpossible}>
                            <FontAwesomeIcon style={{width: "2vw", height: "2vh"}} icon={faRedo}/>
                        </Button>
                    </Nav>
                </Container>
            </Navbar>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={finishDrawing}
                onTouchMove={draw}
                style={{
                    border: "1px solid black",
                }}
            />
        </>
    );
};

export default App;

