// Wordle Game Logic
// 2,315 solution words indexed 1-2315 for shareable puzzle IDs
// 12,972 valid guess words (solutions + additional allowed guesses)

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

let solution = '';
let solutionIndex = 0;
let guesses = [];
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let stats = loadStats();

// DOM Elements
const grid = document.getElementById('grid');
const keyboard = document.getElementById('keyboard');
const messageEl = document.getElementById('message');
const puzzleIdInput = document.getElementById('puzzle-id');
const idBtn = document.getElementById('id-btn');
const randomBtn = document.getElementById('random-btn');
const newGameBtn = document.getElementById('new-game-btn');
const shareBtn = document.getElementById('share-btn');
const statsEl = document.getElementById('stats');

// Valid guesses: all 12,972 words (solutions + additional allowed guesses)
const VALID_GUESSES = new Set([
    ...SOLUTIONS,
    "aahed", "aalii", "aargh", "aarti", "abaca", "abaci", "abacs", "abaft", "abaka", "abamp",
    "aband", "abash", "abask", "abaya", "abbas", "abbed", "abbes", "abcee", "abeam", "abear",
    "abele", "abers", "abets", "abies", "abler", "ables", "ablet", "ablow", "abmho", "abohm",
    "aboil", "aboma", "aboon", "abord", "abore", "abram", "abray", "abrim", "abrin", "abris",
    "absey", "absit", "abuna", "abune", "abuts", "abuzz", "abyes", "abysm", "acais", "acari",
    "accas", "accoy", "acerb", "acers", "aceta", "achar", "ached", "aches", "achoo", "acids",
    "acidy", "acing", "acini", "ackee", "acker", "acmes", "acmic", "acned", "acnes", "acock",
    "acold", "acred", "acres", "acros", "acted", "actin", "acton", "acyls", "adaws", "adays",
    "adbot", "addax", "added", "adder", "addio", "addle", "adeem", "adhan", "adieu", "adios",
    "adits", "adman", "admen", "admix", "adobo", "adown", "adoze", "adrad", "adred", "adsum",
    "aduki", "adunc", "adust", "advew", "adyta", "adzed", "adzes", "aecia", "aedes", "aegis",
    "aeons", "aerie", "aeros", "aesir", "afald", "afara", "afars", "afear", "aflaj", "afore",
    "afrit", "afros", "agama", "agami", "agars", "agast", "agave", "agaze", "agene", "agers",
    "agger", "aggie", "aggri", "aggro", "aggry", "aghas", "agila", "agios", "agism", "agist",
    "agita", "aglee", "aglet", "agley", "agloo", "aglus", "agmas", "agoge", "agone", "agons",
    "agood", "agria", "agrin", "agros", "agued", "agues", "aguna", "aguti", "aheap", "ahent",
    "ahigh", "ahind", "ahing", "ahint", "ahold", "ahull", "ahuru", "aidas", "aided", "aides",
    "aidoi", "aidos", "aiery", "aigas", "aight", "ailed", "aimed", "aimer", "ainee", "ainga",
    "aioli", "aired", "airer", "airns", "airth", "airts", "aitch", "aitus", "aiver", "aiyee",
    "aizle", "ajies", "ajiva", "ajuga", "ajwan", "akees", "akela", "akene", "aking", "akita",
    "akkas", "alaap", "alack", "alamo", "aland", "alane", "alang", "alans", "alant", "alapa",
    "alaps", "alary", "alate", "alays", "albas", "albee", "alcid", "alcos", "aldea", "alder",
    "aldol", "aleck", "alecs", "alefs", "aleft", "aleph", "alews", "aleye", "alfas", "algal",
    "algas", "algid", "algin", "algor", "algum", "alias", "alifs", "aline", "alist", "aliya",
    "alkie", "alkos", "alkyd", "alkyl", "allee", "allel", "allis", "allod", "allyl", "almah",
    "almas", "almeh", "almes", "almud", "almug", "alods", "aloed", "aloes", "aloha", "aloin",
    "aloos", "alowe", "altho", "altos", "alula", "alums", "alure", "alvar", "alway", "amahs",
    "amain", "amate", "amaut", "amban", "ambit", "ambos", "ambry", "ameba", "ameer", "amene",
    "amens", "ament", "amias", "amice", "amici", "amide", "amido", "amids", "amies", "amiga",
    "amigo", "amine", "amino", "amins", "amirs", "amlas", "amman", "ammon", "ammos", "amnia",
    "amnic", "amnio", "amoks", "amole", "amort", "amour", "amove", "amowt", "amped", "ampul",
    "amrit", "amuck", "amyls", "anana", "anata", "ancho", "ancle", "ancon", "andro", "anear",
    "anele", "anent", "angas", "anglo", "anigh", "anile", "anils", "anima", "animi", "anion",
    "anise", "anker", "ankhs", "ankus", "anlas", "annal", "annas", "annat", "anoas", "anole",
    "anomy", "ansae", "antae", "antar", "antas", "anted", "antes", "antis", "antra", "antre",
    "antsy", "anura", "anyon", "apace", "apage", "apaid", "apayd", "apays", "apeak", "apeek",
    "apers", "apert", "apery", "apgar", "aphis", "apian", "apiol", "apish", "apism", "apode",
    "apods", "apoop", "aport", "appal", "appay", "appel", "appro", "appui", "appuy", "apres",
    "apses", "apsis", "apsos", "apted", "apter", "aquae", "aquas", "araba", "araks", "arame",
    "arars", "arbas", "arced", "archi", "arcos", "arcus", "ardeb", "ardri", "aread", "areae",
    "areal", "arear", "areas", "areca", "aredd", "arede", "arefy", "areic", "arene", "arepa",
    "arere", "arete", "arets", "arett", "argal", "argan", "argil", "argle", "argol", "argon",
    "argot", "argus", "arhat", "arias", "ariel", "ariki", "arils", "ariot", "arish", "arked",
    "arled", "arles", "armed", "armer", "armet", "armil", "arnas", "arnut", "aroba", "aroha",
    "aroid", "arpas", "arpen", "arrah", "arras", "arret", "arris", "arroz", "arsed", "arses",
    "arsey", "arsis", "artal", "artel", "artic", "artis", "aruhe", "arums", "arval", "arvee",
    "arvos", "aryls", "asana", "ascon", "ascus", "asdic", "ashed", "ashes", "ashet", "asked",
    "asker", "askoi", "askos", "aspen", "asper", "aspic", "aspie", "aspis", "aspro", "assai",
    "assam", "asses", "assez", "assot", "aster", "astir", "astun", "asura", "asway", "aswim",
    "asyla", "ataps", "ataxy", "atigi", "atilt", "atimy", "atlas", "atman", "atmas", "atmos",
    "atocs", "atoke", "atoks", "atoms", "atomy", "atony", "atopy", "atria", "atrip", "attap",
    "attar", "atuas", "audad", "auger", "aught", "aulas", "aulic", "auloi", "aulos", "aumil",
    "aunes", "aunts", "aurae", "aural", "aurar", "auras", "aurei", "aures", "auric", "auris",
    "aurum", "autos", "auxin", "avale", "avant", "avast", "avels", "avens", "avers", "avgas",
    "avine", "avion", "avise", "aviso", "avize", "avows", "avyze", "awarn", "awato", "awave",
    "aways", "awdls", "aweel", "aweto", "awing", "awmry", "awned", "awner", "awols", "awork",
    "axels", "axile", "axils", "axing", "axite", "axled", "axles", "axman", "axmen", "axoid",
    "axone", "axons", "ayahs", "ayaya", "ayelp", "aygre", "ayins", "ayont", "ayres", "ayrie",
    "azans", "azide", "azido", "azine", "azlon", "azoic", "azole", "azons", "azote", "azoth",
    "azuki", "azurn", "azury", "azygy", "azyme", "azyms", "baaed", "baals", "babas", "babel",
    "babes", "babka", "baboo", "babul", "babus", "bacca", "bacco", "baccy", "bacha", "bachs",
    "backs", "baddy", "baels", "baffs", "baffy", "bafts", "baghs", "bagie", "bahts", "bahus",
    "bahut", "bails", "bairn", "baisa", "baith", "baits", "baiza", "baize", "bajan", "bajra",
    "bajri", "bajus", "baked", "baken", "bakes", "bakra", "balas", "balds", "baldy", "baled",
    "bales", "balks", "balky", "balls", "bally", "balms", "baloo", "balsa", "balti", "balun",
    "balus", "bambi", "banak", "banco", "bancs", "banda", "bandh", "bands", "bandy", "baned",
    "banes", "bangs", "bania", "banks", "banns", "bants", "bantu", "banty", "banya", "bapus",
    "barbe", "barbs", "barby", "barca", "barde", "bardo", "bards", "bardy", "bared", "barer",
    "bares", "barfi", "barfs", "baric", "barks", "barky", "barms", "barmy", "barns", "barny",
    "barps", "barra", "barre", "barro", "barry", "barye", "basan", "based", "basen", "baser",
    "bases", "basho", "basij", "basks", "bason", "basse", "bassi", "basso", "bassy", "basta",
    "basti", "basto", "basts", "bated", "bates", "baths", "batik", "batta", "batts", "battu",
    "bauds", "bauks", "baulk", "baurs", "bavin", "bawds", "bawks", "bawls", "bawns", "bawrs",
    "bawty", "bayed", "bayer", "bayes", "bayle", "bayts", "bazar", "bazoo", "beads", "beaks",
    "beaky", "beals", "beams", "beamy", "beano", "beans", "beany", "beare", "bears", "beath",
    "beats", "beaty", "beaus", "beaut", "beaux", "bebop", "becap", "becke", "becks", "bedad",
    "bedel", "bedes", "bedew", "bedim", "bedye", "beedi", "beefs", "beeps", "beers", "beery",
    "beets", "befog", "begad", "begar", "begem", "begot", "begum", "beige", "beigy", "beins",
    "bekah", "belah", "belar", "belay", "belee", "belga", "bells", "belon", "belts", "bemad",
    "bemas", "bemix", "bemud", "bends", "bendy", "benes", "benet", "benga", "benis", "benne",
    "benni", "benny", "bento", "bents", "benty", "bepat", "beray", "beres", "bergs", "berko",
    "berks", "berme", "berms", "berob", "beryl", "besat", "besaw", "besee", "beses", "besit",
    "besom", "besot", "besti", "bests", "betas", "beted", "betes", "beths", "betid", "beton",
    "betta", "betty", "bever", "bevor", "bevue", "bevvy", "bewet", "bewig", "bezes", "bezil",
    "bezzy", "bhais", "bhaji", "bhang", "bhats", "bhels", "bhoot", "bhuna", "bhuts", "biach",
    "biali", "bialy", "bibbs", "bibes", "biccy", "bices", "bided", "bider", "bides", "bidet",
    "bidis", "bidon", "bield", "biers", "biffo", "biffs", "biffy", "bifid", "bigae", "biggs",
    "biggy", "bigha", "bight", "bigly", "bigos", "bijou", "biked", "biker", "bikes", "bikie",
    "bilbo", "bilby", "biled", "biles", "bilgy", "bilks", "bills", "bimah", "bimas", "bimbo",
    "binal", "bindi", "binds", "biner", "bines", "bings", "bingy", "binit", "binks", "bints",
    "biogs", "biont", "biota", "biped", "bipod", "birds", "birks", "birle", "birls", "biros",
    "birrs", "birse", "birsy", "bises", "bisks", "bisom", "bitch", "biter", "bites", "bitos",
    "bitou", "bitsy", "bitte", "bitts", "bivia", "bivvy", "bizes", "bizzo", "bizzy", "blabs",
    "blads", "blady", "blaer", "blaes", "blaff", "blags", "blahs", "blain", "blams", "blart",
    "blase", "blash", "blate", "blats", "blatt", "blaud", "blawn", "blaws", "blays", "blear",
    "blebs", "blech", "blees", "blent", "blert", "blest", "blets", "bleys", "blimy", "bling",
    "blini", "blins", "bliny", "blips", "blist", "blite", "blits", "blive", "blobs", "blocs",
    "blogs", "blook", "bloop", "blore", "blots", "blows", "blowy", "blubs", "blude", "bluds",
    "bludy", "blued", "blues", "bluet", "bluey", "bluid", "blume", "blunk", "blurs", "blype",
    "boabs", "boaks", "boars", "boart", "boats", "bobac", "bobak", "bobas", "bobol", "bobos",
    "bocca", "bocce", "bocci", "boche", "bocks", "boded", "bodes", "bodge", "bodhi", "bodle",
    "boeps", "boets", "boeuf", "boffo", "boffs", "bogan", "bogey", "boggy", "bogie", "bogle",
    "bogue", "bogus", "bohea", "bohos", "boils", "boing", "boink", "boite", "boked", "bokeh",
    "bokes", "bokos", "bolar", "bolas", "bolds", "boles", "bolix", "bolls", "bolos", "bolts",
    "bolus", "bomas", "bombe", "bombo", "bombs", "bonce", "bonds", "boned", "boner", "bones",
    "bongs", "bonie", "bonks", "bonne", "bonny", "bonza", "bonze", "booai", "booay", "boobs",
    "boody", "booed", "boofy", "boogy", "boohs", "books", "booky", "bools", "booms", "boomy",
    "boong", "boons", "boord", "boors", "boose", "boots", "boppy", "borak", "boral", "boras",
    "borde", "bords", "bored", "boree", "borel", "borer", "bores", "borgo", "boric", "borks",
    "borms", "borna", "boron", "borts", "borty", "bortz", "bosie", "bosks", "bosky", "boson",
    "bosun", "botas", "botel", "botes", "bothy", "botte", "botts", "botty", "bouge", "bouks",
    "boult", "bouns", "bourd", "bourg", "bourn", "bouse", "bousy", "bouts", "bovid", "bowat",
    "bowed", "bower", "bowes", "bowet", "bowie", "bowls", "bowne", "bowrs", "bowse", "boxed",
    "boxen", "boxes", "boxla", "boxty", "boyar", "boyau", "boyed", "boyfs", "boygs", "boyla",
    "boyos", "boysy", "bozos", "braai", "brach", "brack", "bract", "brads", "braes", "brags",
    "brail", "braks", "braky", "brame", "brane", "brank", "brans", "brant", "brast", "brats",
    "brava", "bravi", "braws", "braxy", "brays", "braza", "braze", "bream", "brede", "breds",
    "breem", "breer", "brees", "breid", "breis", "breme", "brens", "brent", "brere", "brers",
    "breve", "brews", "breys", "brier", "bries", "brigs", "briki", "briks", "brill", "brims",
    "brins", "brios", "brise", "briss", "brith", "brits", "britt", "brize", "broch", "brock",
    "brods", "brogh", "brogs", "brome", "bromo", "bronc", "brond", "brool", "broos", "brose",
    "brosy", "brows", "brugh", "bruin", "bruit", "brule", "brume", "brung", "brusk", "brust",
    "bruts", "buats", "buaze", "bubal", "bubas", "bubba", "bubbe", "bubby", "bubus", "buchu",
    "bucko", "bucks", "bucku", "budas", "budis", "budos", "buffa", "buffe", "buffi", "buffo",
    "buffs", "buffy", "bufos", "bufty", "buhls", "buhrs", "buiks", "buist", "bukes", "bulbs",
    "bulgy", "bulks", "bulla", "bulls", "bulse", "bumbo", "bumfs", "bumph", "bumps", "bumpy",
    "bunas", "bunce", "bunco", "bunde", "bundh", "bunds", "bundt", "bundu", "bundy", "bungs",
    "bungy", "bunia", "bunje", "bunjy", "bunko", "bunks", "bunns", "bunts", "bunty", "bunya",
    "buoys", "buppy", "buran", "buras", "burbs", "burds", "buret", "burfi", "burgh", "burgs",
    "burin", "burka", "burke", "burks", "burls", "burns", "buroo", "burps", "burqa", "burro",
    "burrs", "burry", "bursa", "burse", "busby", "buses", "busks", "busky", "bussu", "busti",
    "busts", "busty", "buteo", "butes", "butle", "butoh", "butts", "butty", "butut", "butyl",
    "buzzy", "bwana", "bwazi", "byded", "bydes", "byked", "bykes", "byres", "byrls", "byssi",
    "bytes", "byway", "caaed", "cabas", "caber", "cabob", "caboc", "cabre", "cacas", "cacks",
    "cacky", "cadee", "cades", "cadge", "cadgy", "cadie", "cadis", "cadre", "caeca", "caese",
    "cafes", "caffs", "caged", "cager", "cages", "cagot", "cahow", "caids", "cains", "caird",
    "cajon", "cajun", "caked", "cakes", "cakey", "calfs", "calid", "calif", "calix", "calks",
    "calla", "calls", "calms", "calmy", "calos", "calpa", "calps", "calve", "calyx", "caman",
    "camas", "cames", "camis", "camos", "campi", "campo", "camps", "campy", "camus", "caned",
    "caneh", "caner", "canes", "cangs", "canid", "canna", "canns", "canso", "canst", "canto",
    "cants", "canty", "capas", "caped", "capes", "capex", "caphs", "capiz", "caple", "capon",
    "capos", "capot", "capri", "capul", "carap", "carbo", "carbs", "carby", "cardi", "cards",
    "cardy", "cared", "carer", "cares", "caret", "carex", "carks", "carle", "carls", "carns",
    "carny", "carob", "carom", "caron", "carpi", "carps", "carrs", "carse", "carta", "carte",
    "carts", "carvy", "casas", "casco", "cased", "cases", "casks", "casky", "casts", "casus",
    "cates", "cauda", "cauks", "cauld", "cauls", "caums", "caups", "cauri", "causa", "cavas",
    "caved", "cavel", "caver", "caves", "cavie", "cawed", "cawks", "caxon", "ceaze", "cebid",
    "cecal", "cecum", "ceded", "ceder", "cedes", "cedis", "ceiba", "ceili", "ceils", "celeb",
    "cella", "celli", "cells", "celom", "celts", "cense", "cento", "cents", "centu", "ceorl",
    "cepes", "cerci", "cered", "ceres", "cerge", "ceria", "ceric", "cerne", "ceroc", "ceros",
    "certs", "certy", "cesse", "cesta", "cesti", "cetes", "cetyl", "cezve", "chace", "chack",
    "chaco", "chado", "chads", "chaft", "chais", "chals", "chams", "chana", "chang", "chank",
    "chape", "chaps", "chapt", "chara", "chare", "chark", "charr", "chars", "chary", "chats",
    "chave", "chavs", "chawk", "chaws", "chaya", "chays", "cheep", "chefs", "cheka", "chela",
    "chelp", "chemo", "chems", "chere", "chert", "cheth", "chevy", "chews", "chewy", "chiao",
    "chias", "chibs", "chica", "chich", "chico", "chics", "chiel", "chiks", "chile", "chimb",
    "chimo", "chimp", "chine", "ching", "chink", "chino", "chins", "chips", "chirk", "chirl",
    "chirm", "chiro", "chirr", "chirt", "chiru", "chits", "chive", "chivs", "chivy", "chizz",
    "choco", "chocs", "chode", "chogs", "choil", "choko", "choky", "chola", "choli", "cholo",
    "chomp", "chons", "choof", "chook", "choom", "choon", "chops", "chota", "chott", "chout",
    "choux", "chowk", "chows", "chubs", "chufa", "chuff", "chugs", "chums", "churl", "churr",
    "chuse", "chuts", "chyle", "chyme", "chynd", "cibol", "cided", "cides", "ciels", "ciggy",
    "cilia", "cills", "cimar", "cimex", "cinct", "cines", "cinqs", "cions", "cippi", "circs",
    "cires", "cirls", "cirri", "cisco", "cissy", "cists", "cital", "cited", "citer", "cites",
    "cives", "civet", "civie", "civvy", "clach", "clade", "clads", "claes", "clags", "clame",
    "clams", "clans", "claps", "clapt", "claro", "clart", "clary", "clast", "clats", "claut",
    "clave", "clavi", "claws", "clays", "cleck", "cleek", "cleep", "clefs", "clegs", "cleik",
    "clems", "clepe", "clept", "cleve", "clews", "clied", "clies", "clift", "clime", "cline",
    "clint", "clipe", "clips", "clipt", "clits", "cloam", "clods", "cloff", "clogs", "cloke",
    "clomb", "clomp", "clonk", "clons", "cloop", "cloot", "clops", "clote", "clots", "clour",
    "clous", "clows", "cloye", "cloys", "cloze", "clubs", "clues", "cluey", "clunk", "clype",
    "cnida", "coact", "coady", "coala", "coals", "coaly", "coapt", "coarb", "coate", "coati",
    "coats", "cobbs", "cobby", "cobia", "coble", "cobza", "cocas", "cocci", "cocco", "cocks",
    "cocky", "cocos", "codas", "codec", "coded", "coden", "coder", "codes", "codex", "codon",
    "coeds", "coffs", "cogie", "cogon", "cogue", "cohab", "cohen", "cohoe", "cohog", "cohos",
    "coifs", "coign", "coils", "coins", "coirs", "coits", "coked", "cokes", "colas", "colby",
    "colds", "coled", "coles", "coley", "colic", "colin", "colls", "colly", "colog", "colts",
    "colza", "comae", "comal", "comas", "combe", "combi", "combo", "combs", "comby", "comer",
    "comes", "comix", "commo", "comms", "commy", "compo", "comps", "compt", "comte", "comus",
    "coned", "cones", "coney", "confs", "conga", "conge", "congo", "conia", "conin", "conks",
    "conky", "conne", "conns", "conte", "conto", "conus", "convo", "cooch", "cooed", "cooee",
    "cooer", "cooey", "coofs", "cooks", "cooky", "cools", "cooly", "coomb", "cooms", "coomy",
    "coons", "coops", "coopt", "coost", "coots", "cooze", "copal", "copay", "coped", "copen",
    "coper", "copes", "coppy", "copra", "copsy", "coqui", "coram", "corbe", "corby", "cords",
    "cored", "cores", "corey", "corgi", "coria", "corks", "corky", "corms", "corni", "corno",
    "corns", "cornu", "corps", "corse", "corso", "cosec", "cosed", "coses", "coset", "cosey",
    "cosie", "costa", "coste", "costs", "cotan", "coted", "cotes", "coths", "cotta", "cotts",
    "coude", "coups", "courb", "courd", "coure", "cours", "court", "couta", "couth", "coved"
])

// Initialize
init();

function init() {
    createGrid();
    createKeyboard();
    setupEventListeners();
    loadRandomPuzzle();
    updateStatsDisplay();
}

function createGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.row = i;
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.col = j;
            row.appendChild(tile);
        }
        grid.appendChild(row);
    }
}

function createKeyboard() {
    const rows = [
        'QWERTYUIOP',
        'ASDFGHJKL',
        'ENTERZXCVBNM⌫'
    ];

    keyboard.innerHTML = '';
    rows.forEach((rowKeys, rowIndex) => {
        const row = document.createElement('div');
        row.className = 'keyboard-row';
        [...rowKeys].forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key';
            btn.dataset.key = key;
            if (key === 'ENTER' || key === '⌫') {
                btn.classList.add('wide');
                btn.textContent = key === '⌫' ? '⌫' : 'ENTER';
            } else {
                btn.textContent = key;
            }
            row.appendChild(btn);
        });
        keyboard.appendChild(row);
    });
}

function setupEventListeners() {
    // Puzzle ID input
    idBtn.addEventListener('click', () => {
        const id = parseInt(puzzleIdInput.value);
        if (id >= 1 && id <= SOLUTIONS.length) {
            loadPuzzleById(id);
        } else {
            showMessage(`Puzzle ID must be between 1 and ${SOLUTIONS.length}`);
        }
    });

    randomBtn.addEventListener('click', loadRandomPuzzle);
    newGameBtn.addEventListener('click', loadRandomPuzzle);
    
    shareBtn.addEventListener('click', shareResult);

    // Keyboard clicks
    keyboard.addEventListener('click', e => {
        const btn = e.target.closest('.key');
        if (!btn) return;
        handleKey(btn.dataset.key);
    });

    // Physical keyboard
    document.addEventListener('keydown', e => {
        if (gameOver && e.key !== 'Enter') return;
        if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
            handleKey(e.key.toUpperCase());
        } else if (e.key === 'Enter') {
            handleKey('ENTER');
        } else if (e.key === 'Backspace') {
            handleKey('⌫');
        }
    });

    // Puzzle ID input enter key
    puzzleIdInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') idBtn.click();
    });
}

function loadRandomPuzzle() {
    const randomIndex = Math.floor(Math.random() * SOLUTIONS.length);
    loadPuzzleByIndex(randomIndex);
}

function loadPuzzleById(id) {
    // Convert 1-based ID to 0-based index
    loadPuzzleByIndex(id - 1);
}

function loadPuzzleByIndex(index) {
    solutionIndex = index;
    solution = SOLUTIONS[index].toUpperCase();
    resetGame();
    updatePuzzleIdDisplay();
}

function resetGame() {
    guesses = [];
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    shareBtn.style.display = 'none';
    statsEl.style.display = 'none';
    messageEl.textContent = '';
    
    // Reset grid
    document.querySelectorAll('.tile').forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile';
    });
    
    // Reset keyboard
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}

function updatePuzzleIdDisplay() {
    puzzleIdInput.value = solutionIndex + 1;
    puzzleIdInput.placeholder = `Current: ${solutionIndex + 1}`;
}

function handleKey(key) {
    if (gameOver && key !== 'ENTER') return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === '⌫') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentGuess.length >= WORD_LENGTH) return;
    currentGuess += letter;
    updateTile(currentRow, currentGuess.length - 1, letter);
}

function deleteLetter() {
    if (currentGuess.length === 0) return;
    currentGuess = currentGuess.slice(0, -1);
    updateTile(currentRow, currentGuess.length, '');
}

function updateTile(row, col, letter) {
    const tile = grid.querySelector(`[data-row="${row}"] [data-col="${col}"]`);
    tile.textContent = letter;
    if (letter) {
        tile.classList.add('filled');
    } else {
        tile.classList.remove('filled');
    }
}

function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) {
        showMessage('Not enough letters');
        shakeRow(currentRow);
        return;
    }

    if (!VALID_GUESSES.has(currentGuess.toLowerCase())) {
        showMessage('Not in word list');
        shakeRow(currentRow);
        return;
    }

    const result = evaluateGuess(currentGuess);
    animateRow(currentRow, result);
    updateKeyboard(result);
    
    guesses.push({ word: currentGuess, result });
    currentRow++;
    currentGuess = '';

    if (result.every(r => r === 'correct')) {
        handleWin();
    } else if (currentRow >= MAX_GUESSES) {
        handleLoss();
    }
}

function evaluateGuess(guess) {
    const result = Array(WORD_LENGTH).fill('absent');
    const solutionChars = solution.split('');
    const guessChars = guess.split('');

    // First pass: correct positions
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessChars[i] === solutionChars[i]) {
            result[i] = 'correct';
            solutionChars[i] = null;
            guessChars[i] = null;
        }
    }

    // Second pass: present but wrong position
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessChars[i] === null) continue;
        const idx = solutionChars.indexOf(guessChars[i]);
        if (idx !== -1) {
            result[i] = 'present';
            solutionChars[idx] = null;
        }
    }

    return result;
}

function animateRow(row, result) {
    const tiles = grid.querySelectorAll(`[data-row="${row}"] .tile`);
    tiles.forEach((tile, i) => {
        setTimeout(() => {
            tile.classList.add('flip');
            setTimeout(() => {
                tile.classList.add(result[i]);
            }, 200);
        }, i * 100);
    });
}

function updateKeyboard(result) {
    const guessChars = guesses[guesses.length - 1]?.word.split('') || [];
    guessChars.forEach((char, i) => {
        const key = keyboard.querySelector(`[data-key="${char}"]`);
        if (!key) return;
        
        const current = getKeyState(key);
        const newState = result[i];
        if (keyPriority(newState) > keyPriority(current)) {
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(newState);
        }
    });
}

function getKeyState(key) {
    if (key.classList.contains('correct')) return 'correct';
    if (key.classList.contains('present')) return 'present';
    if (key.classList.contains('absent')) return 'absent';
    return '';
}

function keyPriority(state) {
    const priorities = { correct: 3, present: 2, absent: 1, '': 0 };
    return priorities[state] || 0;
}

function shakeRow(row) {
    const rowEl = grid.querySelector(`[data-row="${row}"]`);
    rowEl.style.animation = 'shake 0.4s ease';
    setTimeout(() => rowEl.style.animation = '', 400);
}

function handleWin() {
    gameOver = true;
    showMessage(`Impressive!`, 'success');
    shareBtn.style.display = 'block';
    updateStats(true, guesses.length);
    setTimeout(() => updateStatsDisplay(), 100);
}

function handleLoss() {
    gameOver = true;
    showMessage(`The word was ${solution}`, 'error');
    shareBtn.style.display = 'block';
    updateStats(false);
    setTimeout(() => updateStatsDisplay(), 100);
}

function showMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#6aaa64' : '#ccc';
    setTimeout(() => {
        if (messageEl.textContent === text) messageEl.textContent = '';
    }, 3000);
}

function updateStats(won, guessCount) {
    stats.played++;
    if (won) {
        stats.wins++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        stats.guessDistribution[guessCount - 1]++;
    } else {
        stats.currentStreak = 0;
    }
    stats.winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    saveStats();
}

function loadStats() {
    const saved = localStorage.getItem('wordle-stats');
    if (saved) return JSON.parse(saved);
    return {
        played: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        winRate: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
    };
}

function saveStats() {
    localStorage.setItem('wordle-stats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    document.getElementById('stat-played').textContent = stats.played;
    document.getElementById('stat-win').textContent = `${stats.winRate}%`;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max').textContent = stats.maxStreak;

    const distContainer = document.getElementById('guess-dist');
    distContainer.innerHTML = '';
    const maxDist = Math.max(...stats.guessDistribution, 1);
    
    stats.guessDistribution.forEach((count, i) => {
        const row = document.createElement('div');
        row.className = 'guess-row';
        const pct = maxDist > 0 ? (count / maxDist) * 100 : 0;
        row.innerHTML = `
            <span class="guess-number">${i + 1}</span>
            <div class="guess-bar"><div class="guess-fill" style="width: ${pct}%"></div></div>
            <span class="guess-count">${count}</span>
        `;
        distContainer.appendChild(row);
    });
    
    statsEl.style.display = 'block';
}

function shareResult() {
    let shareText = `Wordle ${solutionIndex + 1} ${guesses.length}/${MAX_GUESSES}\n\n`;
    guesses.forEach(g => {
        shareText += g.result.map(r => r === 'correct' ? '🟩' : r === 'present' ? '🟨' : '⬛').join('') + '\n';
    });
    shareText += `\nPuzzle ID: ${solutionIndex + 1}`;

    if (navigator.share) {
        navigator.share({ title: 'Wordle Result', text: shareText });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showMessage('Copied to clipboard!', 'success');
        }).catch(() => {
            showMessage('Failed to copy', 'error');
        });
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
}
`;
document.head.appendChild(style);