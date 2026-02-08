export interface GridQuestion {
  id: number;
  book: string;
  verse: string;
  question: string;
  answer: string;
  choices: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Beginner' | 'Intermediate' | 'Expert';
}

export const GRID_QUESTIONS: GridQuestion[] = [
  // EASY / BEGINNER QUESTIONS (30 questions)
  {
    id: 1,
    book: "Genesis",
    verse: "1:1",
    question: "What is the first book of the Bible?",
    answer: "Genesis",
    choices: ["Genesis", "Exodus", "Matthew", "Psalms"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 2,
    book: "Genesis",
    verse: "1:1",
    question: "What did God create in the beginning?",
    answer: "The heavens and the earth",
    choices: ["The heavens and the earth", "Light and darkness", "Man and woman", "The sea and sky"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 3,
    book: "Genesis",
    verse: "1:27",
    question: "Who was the first man created by God?",
    answer: "Adam",
    choices: ["Adam", "Noah", "Abraham", "Moses"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 4,
    book: "Genesis",
    verse: "2:22",
    question: "Who was the first woman in the Bible?",
    answer: "Eve",
    choices: ["Eve", "Sarah", "Ruth", "Mary"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 5,
    book: "Genesis",
    verse: "6:14",
    question: "Who built the ark?",
    answer: "Noah",
    choices: ["Noah", "Moses", "Abraham", "David"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 6,
    book: "Exodus",
    verse: "3:10",
    question: "Who led the Israelites out of Egypt?",
    answer: "Moses",
    choices: ["Moses", "Joshua", "Aaron", "David"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 7,
    book: "Genesis",
    verse: "37:3",
    question: "Who had a coat of many colors?",
    answer: "Joseph",
    choices: ["Joseph", "Jacob", "David", "Solomon"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 8,
    book: "1 Samuel",
    verse: "17:50",
    question: "Who defeated the giant Goliath?",
    answer: "David",
    choices: ["David", "Saul", "Jonathan", "Samson"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 9,
    book: "Jonah",
    verse: "1:17",
    question: "Who was swallowed by a great fish?",
    answer: "Jonah",
    choices: ["Jonah", "Daniel", "Peter", "Paul"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 10,
    book: "Daniel",
    verse: "6:16",
    question: "Who was thrown into the lion's den?",
    answer: "Daniel",
    choices: ["Daniel", "David", "Jonah", "Elijah"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 11,
    book: "Matthew",
    verse: "1:21",
    question: "What is the name of Jesus' mother?",
    answer: "Mary",
    choices: ["Mary", "Martha", "Ruth", "Sarah"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 12,
    book: "Luke",
    verse: "2:7",
    question: "In what town was Jesus born?",
    answer: "Bethlehem",
    choices: ["Bethlehem", "Nazareth", "Jerusalem", "Galilee"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 13,
    book: "Matthew",
    verse: "4:18",
    question: "How many apostles did Jesus choose?",
    answer: "12",
    choices: ["12", "10", "7", "3"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 14,
    book: "Genesis",
    verse: "1:3",
    question: "What was the first thing God created?",
    answer: "Light",
    choices: ["Light", "Water", "Land", "Animals"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 15,
    book: "Exodus",
    verse: "20:1",
    question: "How many commandments did God give Moses?",
    answer: "Ten",
    choices: ["Ten", "Five", "Seven", "Twelve"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 16,
    book: "Genesis",
    verse: "9:13",
    question: "What sign did God give after the flood?",
    answer: "A rainbow",
    choices: ["A rainbow", "A dove", "A star", "A burning bush"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 17,
    book: "Matthew",
    verse: "3:13",
    question: "Who baptized Jesus?",
    answer: "John the Baptist",
    choices: ["John the Baptist", "Peter", "Paul", "Andrew"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 18,
    book: "John",
    verse: "11:35",
    question: "What is the shortest verse in the Bible?",
    answer: "Jesus wept",
    choices: ["Jesus wept", "God is love", "Pray always", "Amen"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 19,
    book: "Genesis",
    verse: "3:6",
    question: "What fruit is associated with the fall of man?",
    answer: "The forbidden fruit",
    choices: ["The forbidden fruit", "An apple", "A fig", "A grape"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 20,
    book: "Matthew",
    verse: "2:1",
    question: "How many wise men visited baby Jesus?",
    answer: "The Bible does not specify",
    choices: ["The Bible does not specify", "Three", "Two", "Four"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 21,
    book: "Genesis",
    verse: "1:31",
    question: "How many days did God take to create the world?",
    answer: "Six days",
    choices: ["Six days", "Seven days", "Five days", "Three days"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 22,
    book: "Psalms",
    verse: "23:1",
    question: "Complete: 'The Lord is my ___'",
    answer: "Shepherd",
    choices: ["Shepherd", "King", "Rock", "Shield"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 23,
    book: "Exodus",
    verse: "14:21",
    question: "Which sea did Moses part?",
    answer: "The Red Sea",
    choices: ["The Red Sea", "The Dead Sea", "The Sea of Galilee", "The Mediterranean"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 24,
    book: "Matthew",
    verse: "14:25",
    question: "Who walked on water?",
    answer: "Jesus",
    choices: ["Jesus", "Peter", "Moses", "Elijah"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 25,
    book: "Genesis",
    verse: "4:1",
    question: "Who were the first two sons of Adam and Eve?",
    answer: "Cain and Abel",
    choices: ["Cain and Abel", "Jacob and Esau", "Isaac and Ishmael", "Moses and Aaron"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 26,
    book: "Luke",
    verse: "2:8",
    question: "Who were told of Jesus' birth by angels?",
    answer: "Shepherds",
    choices: ["Shepherds", "Kings", "Priests", "Soldiers"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 27,
    book: "John",
    verse: "3:16",
    question: "Complete: 'For God so loved the ___'",
    answer: "World",
    choices: ["World", "Church", "People", "Heavens"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 28,
    book: "Acts",
    verse: "9:3",
    question: "Who was blinded on the road to Damascus?",
    answer: "Paul (Saul)",
    choices: ["Paul (Saul)", "Peter", "Stephen", "Barnabas"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 29,
    book: "Revelation",
    verse: "22:21",
    question: "What is the last book of the Bible?",
    answer: "Revelation",
    choices: ["Revelation", "Jude", "Malachi", "Acts"],
    difficulty: "Easy",
    category: "Beginner"
  },
  {
    id: 30,
    book: "Genesis",
    verse: "11:4",
    question: "What tower did people build to reach heaven?",
    answer: "Tower of Babel",
    choices: ["Tower of Babel", "Tower of David", "Tower of Siloam", "Tower of Zion"],
    difficulty: "Easy",
    category: "Beginner"
  },

  // MEDIUM / INTERMEDIATE QUESTIONS (30 questions)
  {
    id: 31,
    book: "Genesis",
    verse: "5:27",
    question: "Who is the oldest person in the Bible, living 969 years?",
    answer: "Methuselah",
    choices: ["Methuselah", "Noah", "Adam", "Enoch"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 32,
    book: "Exodus",
    verse: "7-12",
    question: "How many plagues did God send upon Egypt?",
    answer: "Ten",
    choices: ["Ten", "Seven", "Twelve", "Five"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 33,
    book: "Judges",
    verse: "16:17",
    question: "What was the source of Samson's strength?",
    answer: "His hair",
    choices: ["His hair", "His muscles", "His faith", "A magic ring"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 34,
    book: "1 Kings",
    verse: "3:12",
    question: "Which king asked God for wisdom instead of riches?",
    answer: "Solomon",
    choices: ["Solomon", "David", "Hezekiah", "Josiah"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 35,
    book: "Ruth",
    verse: "4:13",
    question: "Who was Ruth's second husband?",
    answer: "Boaz",
    choices: ["Boaz", "Elimelech", "Naomi", "Jesse"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 36,
    book: "1 Samuel",
    verse: "16:13",
    question: "Who anointed David as king?",
    answer: "Samuel",
    choices: ["Samuel", "Nathan", "Elijah", "Moses"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 37,
    book: "2 Kings",
    verse: "2:11",
    question: "Which prophet was taken to heaven in a chariot of fire?",
    answer: "Elijah",
    choices: ["Elijah", "Elisha", "Enoch", "Moses"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 38,
    book: "Esther",
    verse: "4:14",
    question: "Which queen saved the Jewish people from destruction?",
    answer: "Esther",
    choices: ["Esther", "Jezebel", "Bathsheba", "Vashti"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 39,
    book: "Isaiah",
    verse: "7:14",
    question: "Which prophet said 'a virgin shall conceive'?",
    answer: "Isaiah",
    choices: ["Isaiah", "Jeremiah", "Micah", "Daniel"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 40,
    book: "Matthew",
    verse: "5:3",
    question: "On which mountain did Jesus give the Beatitudes?",
    answer: "Mount of Beatitudes (near Galilee)",
    choices: ["Mount of Beatitudes (near Galilee)", "Mount Sinai", "Mount Zion", "Mount Carmel"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 41,
    book: "Acts",
    verse: "2:1-4",
    question: "What happened on the Day of Pentecost?",
    answer: "The Holy Spirit descended on the apostles",
    choices: ["The Holy Spirit descended on the apostles", "Jesus ascended to heaven", "The temple was destroyed", "Peter was arrested"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 42,
    book: "Genesis",
    verse: "25:30",
    question: "What did Esau sell his birthright for?",
    answer: "A bowl of stew",
    choices: ["A bowl of stew", "A bag of gold", "A piece of land", "A horse"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 43,
    book: "Exodus",
    verse: "16:15",
    question: "What food did God provide in the wilderness?",
    answer: "Manna",
    choices: ["Manna", "Bread", "Fish", "Figs"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 44,
    book: "Joshua",
    verse: "6:20",
    question: "What city's walls fell after the Israelites marched around it?",
    answer: "Jericho",
    choices: ["Jericho", "Jerusalem", "Bethlehem", "Babylon"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 45,
    book: "1 Kings",
    verse: "18:38",
    question: "On which mountain did Elijah challenge the prophets of Baal?",
    answer: "Mount Carmel",
    choices: ["Mount Carmel", "Mount Sinai", "Mount Zion", "Mount Hermon"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 46,
    book: "Matthew",
    verse: "26:15",
    question: "How many pieces of silver was Jesus betrayed for?",
    answer: "Thirty",
    choices: ["Thirty", "Twenty", "Forty", "Ten"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 47,
    book: "John",
    verse: "19:17",
    question: "What is the name of the place where Jesus was crucified?",
    answer: "Golgotha (Calvary)",
    choices: ["Golgotha (Calvary)", "Gethsemane", "Bethany", "Galilee"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 48,
    book: "Genesis",
    verse: "22:2",
    question: "Which son was Abraham asked to sacrifice?",
    answer: "Isaac",
    choices: ["Isaac", "Ishmael", "Jacob", "Esau"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 49,
    book: "Numbers",
    verse: "22:28",
    question: "Whose donkey spoke to him?",
    answer: "Balaam",
    choices: ["Balaam", "Moses", "Abraham", "Elijah"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 50,
    book: "Matthew",
    verse: "14:17",
    question: "How many loaves and fish did Jesus use to feed 5,000?",
    answer: "Five loaves and two fish",
    choices: ["Five loaves and two fish", "Seven loaves and three fish", "Three loaves and five fish", "Ten loaves and one fish"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 51,
    book: "Luke",
    verse: "10:30",
    question: "In the parable, who helped the man beaten by robbers?",
    answer: "A Samaritan",
    choices: ["A Samaritan", "A Pharisee", "A Levite", "A Roman soldier"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 52,
    book: "Mark",
    verse: "6:17",
    question: "Who ordered the beheading of John the Baptist?",
    answer: "King Herod",
    choices: ["King Herod", "Pontius Pilate", "Caesar", "Caiaphas"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 53,
    book: "Genesis",
    verse: "28:12",
    question: "Who dreamed of a ladder reaching to heaven?",
    answer: "Jacob",
    choices: ["Jacob", "Joseph", "Abraham", "Daniel"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 54,
    book: "1 Samuel",
    verse: "17:4",
    question: "How tall was Goliath according to the Bible?",
    answer: "Over nine feet (six cubits and a span)",
    choices: ["Over nine feet (six cubits and a span)", "Seven feet", "Twelve feet", "Five cubits"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 55,
    book: "Galatians",
    verse: "5:22-23",
    question: "How many fruits of the Spirit are listed in Galatians?",
    answer: "Nine",
    choices: ["Nine", "Seven", "Twelve", "Ten"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 56,
    book: "Exodus",
    verse: "3:2",
    question: "What unusual sight did Moses see in the desert?",
    answer: "A burning bush that was not consumed",
    choices: ["A burning bush that was not consumed", "A pillar of cloud", "An angel with a sword", "A golden calf"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 57,
    book: "Matthew",
    verse: "27:5",
    question: "Which apostle betrayed Jesus?",
    answer: "Judas Iscariot",
    choices: ["Judas Iscariot", "Peter", "Thomas", "Andrew"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 58,
    book: "Luke",
    verse: "15:11",
    question: "In the Parable of the Prodigal Son, what did the son spend his inheritance on?",
    answer: "Wild living",
    choices: ["Wild living", "A farm", "Building a house", "Charity"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 59,
    book: "Acts",
    verse: "16:25",
    question: "What happened when Paul and Silas sang in prison?",
    answer: "An earthquake opened the prison doors",
    choices: ["An earthquake opened the prison doors", "An angel appeared", "The guards fell asleep", "Fire came from heaven"],
    difficulty: "Medium",
    category: "Intermediate"
  },
  {
    id: 60,
    book: "John",
    verse: "20:25",
    question: "Which apostle doubted Jesus' resurrection until he saw the wounds?",
    answer: "Thomas",
    choices: ["Thomas", "Peter", "John", "Philip"],
    difficulty: "Medium",
    category: "Intermediate"
  },

  // HARD / EXPERT QUESTIONS (30 questions)
  {
    id: 61,
    book: "Ezekiel",
    verse: "37:1",
    question: "In Ezekiel's vision, what came to life in the valley?",
    answer: "Dry bones",
    choices: ["Dry bones", "Dead soldiers", "Fallen trees", "Stone statues"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 62,
    book: "Revelation",
    verse: "4:7",
    question: "How many living creatures surround God's throne in Revelation?",
    answer: "Four",
    choices: ["Four", "Seven", "Two", "Twelve"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 63,
    book: "Genesis",
    verse: "14:18",
    question: "Who was the King of Salem and priest of the Most High God?",
    answer: "Melchizedek",
    choices: ["Melchizedek", "Abraham", "Aaron", "David"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 64,
    book: "Hebrews",
    verse: "11:5",
    question: "Which two people in the Bible never died?",
    answer: "Enoch and Elijah",
    choices: ["Enoch and Elijah", "Moses and Elijah", "Enoch and Moses", "Abraham and David"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 65,
    book: "Revelation",
    verse: "13:18",
    question: "What is the 'number of the beast' in Revelation?",
    answer: "666",
    choices: ["666", "777", "616", "999"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 66,
    book: "Job",
    verse: "1:1",
    question: "What land was Job from?",
    answer: "Uz",
    choices: ["Uz", "Ur", "Eden", "Canaan"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 67,
    book: "Daniel",
    verse: "5:25",
    question: "What words appeared on the wall during Belshazzar's feast?",
    answer: "Mene, Mene, Tekel, Upharsin",
    choices: ["Mene, Mene, Tekel, Upharsin", "Holy, Holy, Holy", "Repent and Be Saved", "The End Is Near"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 68,
    book: "1 Kings",
    verse: "10:1",
    question: "Which queen visited Solomon to test his wisdom?",
    answer: "Queen of Sheba",
    choices: ["Queen of Sheba", "Queen Esther", "Queen Jezebel", "Queen Vashti"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 69,
    book: "Exodus",
    verse: "28:30",
    question: "What objects were used by the high priest for divine decisions?",
    answer: "Urim and Thummim",
    choices: ["Urim and Thummim", "Bread and wine", "Staff and rod", "Scroll and seal"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 70,
    book: "Judges",
    verse: "7:7",
    question: "How many soldiers did Gideon take into battle after God reduced his army?",
    answer: "300",
    choices: ["300", "1,000", "500", "100"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 71,
    book: "Isaiah",
    verse: "6:2",
    question: "How many wings do Seraphim have?",
    answer: "Six",
    choices: ["Six", "Four", "Two", "Eight"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 72,
    book: "Acts",
    verse: "5:1-5",
    question: "Which couple lied about the price of their land and died?",
    answer: "Ananias and Sapphira",
    choices: ["Ananias and Sapphira", "Aquila and Priscilla", "Abraham and Sarah", "Boaz and Ruth"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 73,
    book: "2 Kings",
    verse: "5:14",
    question: "How many times did Naaman dip in the Jordan to be healed?",
    answer: "Seven",
    choices: ["Seven", "Three", "Five", "Ten"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 74,
    book: "Revelation",
    verse: "2-3",
    question: "How many churches are addressed in Revelation?",
    answer: "Seven",
    choices: ["Seven", "Twelve", "Five", "Ten"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 75,
    book: "Nehemiah",
    verse: "6:15",
    question: "How many days did it take Nehemiah to rebuild the wall of Jerusalem?",
    answer: "52 days",
    choices: ["52 days", "40 days", "70 days", "30 days"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 76,
    book: "Ezra",
    verse: "1:1",
    question: "Which Persian king allowed the Jews to return from exile?",
    answer: "Cyrus",
    choices: ["Cyrus", "Darius", "Xerxes", "Nebuchadnezzar"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 77,
    book: "Matthew",
    verse: "17:1",
    question: "Which three disciples witnessed the Transfiguration?",
    answer: "Peter, James, and John",
    choices: ["Peter, James, and John", "Peter, Andrew, and John", "James, John, and Matthew", "Peter, Thomas, and James"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 78,
    book: "1 Corinthians",
    verse: "15:6",
    question: "After His resurrection, how many people did Jesus appear to at once?",
    answer: "More than 500",
    choices: ["More than 500", "120", "70", "Twelve"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 79,
    book: "Leviticus",
    verse: "16:8",
    question: "What was the name of the goat sent into the wilderness on the Day of Atonement?",
    answer: "Scapegoat (Azazel)",
    choices: ["Scapegoat (Azazel)", "Sacrificial lamb", "Sin offering", "Burnt goat"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 80,
    book: "Numbers",
    verse: "21:9",
    question: "What did Moses lift up to heal snake-bitten Israelites?",
    answer: "A bronze serpent",
    choices: ["A bronze serpent", "His staff", "A golden calf", "The Ark of the Covenant"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 81,
    book: "Genesis",
    verse: "46:27",
    question: "How many of Jacob's family went to Egypt?",
    answer: "70",
    choices: ["70", "40", "100", "12"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 82,
    book: "1 Kings",
    verse: "6:1",
    question: "How long did it take Solomon to build the temple?",
    answer: "Seven years",
    choices: ["Seven years", "Forty years", "Three years", "Twenty years"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 83,
    book: "Daniel",
    verse: "3:1",
    question: "What was the golden image Nebuchadnezzar set up in Dura?",
    answer: "A ninety-foot golden statue",
    choices: ["A ninety-foot golden statue", "A golden calf", "A golden throne", "A golden temple"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 84,
    book: "Philemon",
    verse: "1:10",
    question: "What was the name of the slave Paul sent back to Philemon?",
    answer: "Onesimus",
    choices: ["Onesimus", "Tychicus", "Timothy", "Silas"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 85,
    book: "Judges",
    verse: "4:21",
    question: "Who killed Sisera by driving a tent peg through his head?",
    answer: "Jael",
    choices: ["Jael", "Deborah", "Ruth", "Rahab"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 86,
    book: "2 Samuel",
    verse: "6:7",
    question: "Who was struck dead for touching the Ark of the Covenant?",
    answer: "Uzzah",
    choices: ["Uzzah", "Aaron", "Eli", "Nadab"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 87,
    book: "Revelation",
    verse: "21:19-20",
    question: "How many gates does the New Jerusalem have?",
    answer: "Twelve",
    choices: ["Twelve", "Seven", "Four", "Ten"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 88,
    book: "Hosea",
    verse: "1:2",
    question: "Which prophet was told to marry an unfaithful wife as a symbol of Israel's unfaithfulness?",
    answer: "Hosea",
    choices: ["Hosea", "Jeremiah", "Amos", "Micah"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 89,
    book: "Genesis",
    verse: "32:28",
    question: "What name did God give Jacob after wrestling with him?",
    answer: "Israel",
    choices: ["Israel", "Abraham", "Judah", "Benjamin"],
    difficulty: "Hard",
    category: "Expert"
  },
  {
    id: 90,
    book: "Matthew",
    verse: "27:51",
    question: "What happened in the temple when Jesus died on the cross?",
    answer: "The veil was torn in two",
    choices: ["The veil was torn in two", "The altar crumbled", "Fire consumed it", "It collapsed"],
    difficulty: "Hard",
    category: "Expert"
  }
];

export function getQuestionsForGrid(): { easy: GridQuestion[]; medium: GridQuestion[]; hard: GridQuestion[] } {
  const easy = GRID_QUESTIONS.filter(q => q.difficulty === 'Easy');
  const medium = GRID_QUESTIONS.filter(q => q.difficulty === 'Medium');
  const hard = GRID_QUESTIONS.filter(q => q.difficulty === 'Hard');

  const shuffle = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return {
    easy: shuffle(easy).slice(0, 10),
    medium: shuffle(medium).slice(0, 10),
    hard: shuffle(hard).slice(0, 10)
  };
}
