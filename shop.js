/* ==========================================================================
   KHELZONE — Shop Page Logic
   ========================================================================== */

/* ---------------------------------------------------------------------- *
 * 1. PRODUCT DATA (generated — 11 sports x 32 products = 352 total)
 * ---------------------------------------------------------------------- */
const PRODUCTS = [
  { id:1, name:"KHELZONE Pro Match Football", category:"Balls", sport:"Football", price:11300, oldPrice:13650, discount:17, rating:4.6, reviews:145, image:"https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:17, badge:"NEW", brand:"KHELZONE" },
  { id:2, name:"Star Impact Training Football", category:"Balls", sport:"Football", price:3100, oldPrice:4250, discount:27, rating:4.6, reviews:299, image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:8, badge:"BEST SELLER", brand:"Nike" },
  { id:3, name:"Elite Football Boots FG", category:"Shoes", sport:"Football", price:10450, oldPrice:13500, discount:23, rating:3.9, reviews:131, image:"https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:17, badge:"SALE", brand:"Adidas" },
  { id:4, name:"Elite Football Boots TF", category:"Shoes", sport:"Football", price:9100, oldPrice:12200, discount:25, rating:4.5, reviews:299, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:29, badge:"TRENDING", brand:"Puma" },
  { id:5, name:"Predator Speed Boots", category:"Shoes", sport:"Football", price:4400, oldPrice:5750, discount:23, rating:4.2, reviews:23, image:"https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:51, badge:"LIMITED", brand:"Decathlon" },
  { id:6, name:"Professional Goalkeeper Gloves", category:"Gloves", sport:"Football", price:3400, oldPrice:4650, discount:27, rating:4.2, reviews:99, image:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:16, badge:"TOP RATED", brand:"KHELZONE" },
  { id:7, name:"Junior Goalkeeper Gloves", category:"Gloves", sport:"Football", price:6300, oldPrice:7600, discount:17, rating:4.3, reviews:203, image:"https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:57, badge:"", brand:"Nike" },
  { id:8, name:"KHELZONE Football Jersey Home", category:"Jerseys", sport:"Football", price:6450, oldPrice:8650, discount:25, rating:4.7, reviews:255, image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:37, badge:"", brand:"Adidas" },
  { id:9, name:"KHELZONE Football Jersey Away", category:"Jerseys", sport:"Football", price:2850, oldPrice:4100, discount:30, rating:4.3, reviews:302, image:"https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:21, badge:"", brand:"Puma" },
  { id:10, name:"Club Replica Jersey", category:"Jerseys", sport:"Football", price:11100, oldPrice:14950, discount:26, rating:4.8, reviews:315, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:15, badge:"NEW", brand:"Decathlon" },
  { id:11, name:"Shin Guards Pro Shield", category:"Protective Gear", sport:"Football", price:12350, oldPrice:14800, discount:17, rating:4.6, reviews:168, image:"https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:8, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:12, name:"Ankle Support Guard", category:"Protective Gear", sport:"Football", price:4600, oldPrice:6500, discount:29, rating:4.3, reviews:252, image:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:43, badge:"SALE", brand:"Nike" },
  { id:13, name:"Football Socks Pro", category:"Accessories", sport:"Football", price:6800, oldPrice:8300, discount:18, rating:4.3, reviews:156, image:"https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:47, badge:"TRENDING", brand:"Adidas" },
  { id:14, name:"Captain's Armband", category:"Accessories", sport:"Football", price:12000, oldPrice:16250, discount:26, rating:4.5, reviews:107, image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:37, badge:"LIMITED", brand:"Puma" },
  { id:15, name:"Training Cone Set", category:"Accessories", sport:"Football", price:12750, oldPrice:15900, discount:20, rating:4.4, reviews:158, image:"https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:43, badge:"TOP RATED", brand:"Decathlon" },
  { id:16, name:"Football Pump & Needle Kit", category:"Accessories", sport:"Football", price:12050, oldPrice:16050, discount:25, rating:4.6, reviews:48, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:17, badge:"", brand:"KHELZONE" },
  { id:17, name:"Goalkeeper Jersey", category:"Jerseys", sport:"Football", price:1300, oldPrice:1800, discount:28, rating:4.3, reviews:53, image:"https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:16, badge:"", brand:"Nike" },
  { id:18, name:"Futsal Ball", category:"Balls", sport:"Football", price:10100, oldPrice:14300, discount:29, rating:4.2, reviews:275, image:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:28, badge:"", brand:"Adidas" },
  { id:19, name:"Beach Football", category:"Balls", sport:"Football", price:11350, oldPrice:14800, discount:23, rating:4.2, reviews:146, image:"https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:50, badge:"NEW", brand:"Puma" },
  { id:20, name:"Football Kit Bag", category:"Bags", sport:"Football", price:10000, oldPrice:13250, discount:25, rating:4.6, reviews:239, image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:40, badge:"BEST SELLER", brand:"Decathlon" },
  { id:21, name:"Referee Whistle Kit", category:"Accessories", sport:"Football", price:7350, oldPrice:9400, discount:22, rating:4.9, reviews:90, image:"https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:35, badge:"SALE", brand:"KHELZONE" },
  { id:22, name:"Football Headband", category:"Accessories", sport:"Football", price:8900, oldPrice:10700, discount:17, rating:3.9, reviews:76, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:12, badge:"TRENDING", brand:"Nike" },
  { id:23, name:"Compression Base Layer", category:"Apparel", sport:"Football", price:11100, oldPrice:13600, discount:18, rating:4.6, reviews:325, image:"https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:7, badge:"LIMITED", brand:"Adidas" },
  { id:24, name:"Football Shorts", category:"Apparel", sport:"Football", price:7100, oldPrice:9100, discount:22, rating:4.9, reviews:290, image:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:19, badge:"TOP RATED", brand:"Puma" },
  { id:25, name:"Mini Goal Post Set", category:"Accessories", sport:"Football", price:9850, oldPrice:13900, discount:29, rating:3.9, reviews:78, image:"https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:46, badge:"", brand:"Decathlon" },
  { id:26, name:"Agility Ladder", category:"Accessories", sport:"Football", price:9600, oldPrice:13250, discount:28, rating:4.7, reviews:194, image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:10, badge:"", brand:"KHELZONE" },
  { id:27, name:"Football Gloves Field Player", category:"Gloves", sport:"Football", price:5600, oldPrice:7250, discount:23, rating:4.4, reviews:154, image:"https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:35, badge:"", brand:"Nike" },
  { id:28, name:"Match Day Tracksuit", category:"Apparel", sport:"Football", price:3750, oldPrice:4950, discount:24, rating:4.0, reviews:340, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:22, badge:"NEW", brand:"Adidas" },
  { id:29, name:"Football Water Bottle", category:"Accessories", sport:"Football", price:11250, oldPrice:14800, discount:24, rating:4.1, reviews:211, image:"https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:51, badge:"BEST SELLER", brand:"Puma" },
  { id:30, name:"Team Training Bibs Set of 5", category:"Accessories", sport:"Football", price:3450, oldPrice:4550, discount:24, rating:4.7, reviews:291, image:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:0, badge:"SALE", brand:"Decathlon" },
  { id:31, name:"Football Boot Bag", category:"Bags", sport:"Football", price:10600, oldPrice:13450, discount:21, rating:3.9, reviews:205, image:"https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:59, badge:"TRENDING", brand:"KHELZONE" },
  { id:32, name:"Indoor Court Football Shoes", category:"Shoes", sport:"Football", price:5850, oldPrice:7300, discount:20, rating:4.1, reviews:310, image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:8, badge:"LIMITED", brand:"Nike" },
  { id:33, name:"Professional Cricket Bat", category:"Bats", sport:"Cricket", price:3500, oldPrice:4800, discount:27, rating:4.7, reviews:292, image:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80", description:"Balanced willow construction engineered for power and control through the crease.", sizes:["Short Handle","Long Handle"], stock:52, badge:"NEW", brand:"KHELZONE" },
  { id:34, name:"English Willow Bat", category:"Bats", sport:"Cricket", price:4800, oldPrice:5850, discount:18, rating:4.4, reviews:301, image:"https://images.unsplash.com/photo-1626248801463-3f2d1b5b5e9e?w=600&q=80", description:"Balanced willow construction engineered for power and control through the crease.", sizes:["Short Handle","Long Handle"], stock:13, badge:"BEST SELLER", brand:"SG" },
  { id:35, name:"Kashmir Willow Bat", category:"Bats", sport:"Cricket", price:9400, oldPrice:12450, discount:24, rating:4.5, reviews:128, image:"https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80", description:"Balanced willow construction engineered for power and control through the crease.", sizes:["Short Handle","Long Handle"], stock:37, badge:"SALE", brand:"SS" },
  { id:36, name:"Junior Cricket Bat", category:"Bats", sport:"Cricket", price:7300, oldPrice:10000, discount:27, rating:4.3, reviews:211, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Balanced willow construction engineered for power and control through the crease.", sizes:["Short Handle","Long Handle"], stock:31, badge:"TRENDING", brand:"MRF" },
  { id:37, name:"Tennis Ball Cricket Bat", category:"Bats", sport:"Cricket", price:17650, oldPrice:23000, discount:23, rating:4.1, reviews:52, image:"https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600&q=80", description:"Balanced willow construction engineered for power and control through the crease.", sizes:["Short Handle","Long Handle"], stock:24, badge:"LIMITED", brand:"DSC" },
  { id:38, name:"Professional Cricket Batting Gloves", category:"Gloves", sport:"Cricket", price:1400, oldPrice:1850, discount:24, rating:4.1, reviews:132, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:0, badge:"TOP RATED", brand:"KHELZONE" },
  { id:39, name:"Wicket Keeping Gloves", category:"Gloves", sport:"Cricket", price:3050, oldPrice:4200, discount:27, rating:4.0, reviews:54, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:5, badge:"", brand:"SG" },
  { id:40, name:"Cricket Helmet Titanium Guard", category:"Protective Gear", sport:"Cricket", price:11550, oldPrice:13850, discount:17, rating:4.1, reviews:268, image:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:16, badge:"", brand:"SS" },
  { id:41, name:"Cricket Batting Pads", category:"Protective Gear", sport:"Cricket", price:5050, oldPrice:6950, discount:27, rating:4.8, reviews:315, image:"https://images.unsplash.com/photo-1626248801463-3f2d1b5b5e9e?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:33, badge:"", brand:"MRF" },
  { id:42, name:"Wicket Keeping Pads", category:"Protective Gear", sport:"Cricket", price:8650, oldPrice:12050, discount:28, rating:4.7, reviews:117, image:"https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:9, badge:"NEW", brand:"DSC" },
  { id:43, name:"Thigh Guard", category:"Protective Gear", sport:"Cricket", price:3900, oldPrice:5300, discount:26, rating:4.3, reviews:230, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:32, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:44, name:"Arm Guard", category:"Protective Gear", sport:"Cricket", price:2500, oldPrice:3400, discount:26, rating:4.9, reviews:70, image:"https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:6, badge:"SALE", brand:"SG" },
  { id:45, name:"Chest Guard", category:"Protective Gear", sport:"Cricket", price:13900, oldPrice:19150, discount:27, rating:4.7, reviews:75, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:18, badge:"TRENDING", brand:"SS" },
  { id:46, name:"Abdominal Guard", category:"Protective Gear", sport:"Cricket", price:7000, oldPrice:8600, discount:19, rating:4.3, reviews:236, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:14, badge:"LIMITED", brand:"MRF" },
  { id:47, name:"Cricket Spike Shoes", category:"Shoes", sport:"Cricket", price:9850, oldPrice:12850, discount:23, rating:4.8, reviews:58, image:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:31, badge:"TOP RATED", brand:"DSC" },
  { id:48, name:"Cricket Rubber Sole Shoes", category:"Shoes", sport:"Cricket", price:3900, oldPrice:4650, discount:16, rating:4.9, reviews:27, image:"https://images.unsplash.com/photo-1626248801463-3f2d1b5b5e9e?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:8, badge:"", brand:"KHELZONE" },
  { id:49, name:"Premium Cricket Ball", category:"Balls", sport:"Cricket", price:8450, oldPrice:10350, discount:18, rating:4.4, reviews:129, image:"https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:58, badge:"", brand:"SG" },
  { id:50, name:"Training Ball Soft", category:"Balls", sport:"Cricket", price:13850, oldPrice:19700, discount:30, rating:4.1, reviews:21, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:27, badge:"", brand:"SS" },
  { id:51, name:"Tennis Cricket Ball", category:"Balls", sport:"Cricket", price:9400, oldPrice:13450, discount:30, rating:4.7, reviews:166, image:"https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:30, badge:"NEW", brand:"MRF" },
  { id:52, name:"Cricket Kit Bag", category:"Bags", sport:"Cricket", price:16650, oldPrice:20350, discount:18, rating:4.2, reviews:49, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:40, badge:"BEST SELLER", brand:"DSC" },
  { id:53, name:"Wheelie Cricket Kit Bag", category:"Bags", sport:"Cricket", price:2700, oldPrice:3750, discount:28, rating:4.0, reviews:319, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:33, badge:"SALE", brand:"KHELZONE" },
  { id:54, name:"Stumps Set Wooden", category:"Accessories", sport:"Cricket", price:17200, oldPrice:24550, discount:30, rating:4.4, reviews:49, image:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:35, badge:"TRENDING", brand:"SG" },
  { id:55, name:"Cricket Bails", category:"Accessories", sport:"Cricket", price:3300, oldPrice:4650, discount:29, rating:4.0, reviews:54, image:"https://images.unsplash.com/photo-1626248801463-3f2d1b5b5e9e?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:46, badge:"LIMITED", brand:"SS" },
  { id:56, name:"Bat Grip Tape", category:"Accessories", sport:"Cricket", price:8400, oldPrice:10850, discount:23, rating:4.8, reviews:311, image:"https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:18, badge:"TOP RATED", brand:"MRF" },
  { id:57, name:"Bat Cover", category:"Accessories", sport:"Cricket", price:2000, oldPrice:2700, discount:26, rating:4.3, reviews:318, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:39, badge:"", brand:"DSC" },
  { id:58, name:"Cricket Cap", category:"Accessories", sport:"Cricket", price:17850, oldPrice:22600, discount:21, rating:4.2, reviews:180, image:"https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:18, badge:"", brand:"KHELZONE" },
  { id:59, name:"Cricket Team Jersey ODI", category:"Jerseys", sport:"Cricket", price:9400, oldPrice:12100, discount:22, rating:4.6, reviews:173, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:32, badge:"", brand:"SG" },
  { id:60, name:"Cricket Team Jersey T20", category:"Jerseys", sport:"Cricket", price:11050, oldPrice:15800, discount:30, rating:4.8, reviews:24, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:32, badge:"NEW", brand:"SS" },
  { id:61, name:"Cricket Team Trousers", category:"Apparel", sport:"Cricket", price:4000, oldPrice:4800, discount:17, rating:4.1, reviews:155, image:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:11, badge:"BEST SELLER", brand:"MRF" },
  { id:62, name:"Bat Grip Handle", category:"Accessories", sport:"Cricket", price:12150, oldPrice:17250, discount:30, rating:4.8, reviews:209, image:"https://images.unsplash.com/photo-1626248801463-3f2d1b5b5e9e?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:21, badge:"SALE", brand:"DSC" },
  { id:63, name:"Cricket Sunglasses", category:"Accessories", sport:"Cricket", price:5850, oldPrice:7600, discount:23, rating:4.4, reviews:174, image:"https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:42, badge:"TRENDING", brand:"KHELZONE" },
  { id:64, name:"Bowling Machine Balls Pack", category:"Balls", sport:"Cricket", price:950, oldPrice:1300, discount:27, rating:4.5, reviews:73, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:59, badge:"LIMITED", brand:"SG" },
  { id:65, name:"Carbon Pro Tennis Racket", category:"Rackets", sport:"Tennis", price:2800, oldPrice:3500, discount:20, rating:4.8, reviews:303, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:12, badge:"NEW", brand:"KHELZONE" },
  { id:66, name:"Junior Tennis Racket", category:"Rackets", sport:"Tennis", price:5050, oldPrice:6350, discount:20, rating:4.1, reviews:195, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:16, badge:"BEST SELLER", brand:"Nike" },
  { id:67, name:"Tournament Tennis Racket", category:"Rackets", sport:"Tennis", price:11000, oldPrice:15500, discount:29, rating:4.4, reviews:148, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:57, badge:"SALE", brand:"Adidas" },
  { id:68, name:"Tournament Tennis Balls Pack of 3", category:"Balls", sport:"Tennis", price:1450, oldPrice:1750, discount:17, rating:4.3, reviews:161, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:5, badge:"TRENDING", brand:"Yonex" },
  { id:69, name:"Practice Tennis Balls Pack of 6", category:"Balls", sport:"Tennis", price:650, oldPrice:850, discount:24, rating:4.0, reviews:154, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:13, badge:"LIMITED", brand:"Decathlon" },
  { id:70, name:"Professional Tennis Shoes", category:"Shoes", sport:"Tennis", price:7850, oldPrice:10450, discount:25, rating:4.3, reviews:24, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:10, badge:"TOP RATED", brand:"KHELZONE" },
  { id:71, name:"Clay Court Tennis Shoes", category:"Shoes", sport:"Tennis", price:1850, oldPrice:2650, discount:30, rating:4.6, reviews:96, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:37, badge:"", brand:"Nike" },
  { id:72, name:"Tennis Racket Bag", category:"Bags", sport:"Tennis", price:1200, oldPrice:1700, discount:29, rating:4.5, reviews:95, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:30, badge:"", brand:"Adidas" },
  { id:73, name:"Tennis Backpack", category:"Bags", sport:"Tennis", price:2700, oldPrice:3200, discount:16, rating:4.3, reviews:40, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:25, badge:"", brand:"Yonex" },
  { id:74, name:"Tennis Grip Tape", category:"Accessories", sport:"Tennis", price:4050, oldPrice:5500, discount:26, rating:4.6, reviews:201, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:52, badge:"NEW", brand:"Decathlon" },
  { id:75, name:"Overgrip Pack of 3", category:"Accessories", sport:"Tennis", price:9750, oldPrice:13850, discount:30, rating:4.3, reviews:337, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:50, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:76, name:"Tennis Wristband Set", category:"Accessories", sport:"Tennis", price:3150, oldPrice:4500, discount:30, rating:4.1, reviews:103, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:54, badge:"SALE", brand:"Nike" },
  { id:77, name:"Tennis Headband", category:"Accessories", sport:"Tennis", price:3500, oldPrice:4950, discount:29, rating:3.9, reviews:190, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:53, badge:"TRENDING", brand:"Adidas" },
  { id:78, name:"Tennis Polo Shirt", category:"Apparel", sport:"Tennis", price:7350, oldPrice:10250, discount:28, rating:4.8, reviews:147, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:20, badge:"LIMITED", brand:"Yonex" },
  { id:79, name:"Tennis Skirt", category:"Apparel", sport:"Tennis", price:3200, oldPrice:4450, discount:28, rating:4.0, reviews:39, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:57, badge:"TOP RATED", brand:"Decathlon" },
  { id:80, name:"Tennis Shorts", category:"Apparel", sport:"Tennis", price:8300, oldPrice:10300, discount:19, rating:4.7, reviews:255, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:25, badge:"", brand:"KHELZONE" },
  { id:81, name:"Tennis String Reel", category:"Accessories", sport:"Tennis", price:5600, oldPrice:7850, discount:29, rating:4.8, reviews:134, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:0, badge:"", brand:"Nike" },
  { id:82, name:"Vibration Dampener", category:"Accessories", sport:"Tennis", price:3750, oldPrice:4850, discount:23, rating:4.2, reviews:55, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:52, badge:"", brand:"Adidas" },
  { id:83, name:"Tennis Ball Hopper", category:"Accessories", sport:"Tennis", price:5150, oldPrice:6550, discount:21, rating:4.4, reviews:294, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:24, badge:"NEW", brand:"Yonex" },
  { id:84, name:"Portable Tennis Net", category:"Accessories", sport:"Tennis", price:1050, oldPrice:1250, discount:16, rating:4.9, reviews:111, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:40, badge:"BEST SELLER", brand:"Decathlon" },
  { id:85, name:"Court Line Marking Kit", category:"Accessories", sport:"Tennis", price:4950, oldPrice:5900, discount:16, rating:4.5, reviews:196, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:49, badge:"SALE", brand:"KHELZONE" },
  { id:86, name:"Tennis Cap", category:"Accessories", sport:"Tennis", price:5750, oldPrice:7450, discount:23, rating:4.9, reviews:79, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:27, badge:"TRENDING", brand:"Nike" },
  { id:87, name:"Racket Stringing Kit", category:"Accessories", sport:"Tennis", price:10050, oldPrice:12350, discount:19, rating:3.9, reviews:243, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:0, badge:"LIMITED", brand:"Adidas" },
  { id:88, name:"Tennis Elbow Support", category:"Protective Gear", sport:"Tennis", price:9100, oldPrice:13000, discount:30, rating:4.4, reviews:120, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:26, badge:"TOP RATED", brand:"Yonex" },
  { id:89, name:"Tennis Socks Pack of 3", category:"Accessories", sport:"Tennis", price:7650, oldPrice:9150, discount:16, rating:4.6, reviews:189, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:42, badge:"", brand:"Decathlon" },
  { id:90, name:"Tennis Ball Machine Balls", category:"Balls", sport:"Tennis", price:5750, oldPrice:7800, discount:26, rating:4.0, reviews:173, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:35, badge:"", brand:"KHELZONE" },
  { id:91, name:"Padel Racket", category:"Rackets", sport:"Tennis", price:5650, oldPrice:7700, discount:27, rating:4.2, reviews:171, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:38, badge:"", brand:"Nike" },
  { id:92, name:"Tennis Jacket", category:"Apparel", sport:"Tennis", price:2700, oldPrice:3350, discount:19, rating:4.6, reviews:214, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:46, badge:"NEW", brand:"Adidas" },
  { id:93, name:"Compression Tennis Sleeve", category:"Protective Gear", sport:"Tennis", price:3450, oldPrice:4650, discount:26, rating:4.2, reviews:300, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:56, badge:"BEST SELLER", brand:"Yonex" },
  { id:94, name:"Tennis Duffel Bag", category:"Bags", sport:"Tennis", price:600, oldPrice:750, discount:20, rating:4.1, reviews:316, image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:41, badge:"SALE", brand:"Decathlon" },
  { id:95, name:"Tennis Visor", category:"Accessories", sport:"Tennis", price:5900, oldPrice:7700, discount:23, rating:4.3, reviews:129, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:35, badge:"TRENDING", brand:"KHELZONE" },
  { id:96, name:"Pro Tour Tennis Racket", category:"Rackets", sport:"Tennis", price:8350, oldPrice:11650, discount:28, rating:4.9, reviews:106, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:45, badge:"LIMITED", brand:"Nike" },
  { id:97, name:"Official Size Basketball", category:"Balls", sport:"Basketball", price:2600, oldPrice:3250, discount:20, rating:4.6, reviews:337, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:24, badge:"NEW", brand:"KHELZONE" },
  { id:98, name:"Street Basketball", category:"Balls", sport:"Basketball", price:2750, oldPrice:3850, discount:29, rating:4.7, reviews:178, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:17, badge:"BEST SELLER", brand:"Nike" },
  { id:99, name:"Indoor Composite Basketball", category:"Balls", sport:"Basketball", price:4450, oldPrice:5450, discount:18, rating:3.9, reviews:263, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:42, badge:"SALE", brand:"Adidas" },
  { id:100, name:"Basketball Performance Shoes", category:"Shoes", sport:"Basketball", price:2400, oldPrice:3150, discount:24, rating:4.8, reviews:314, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:15, badge:"TRENDING", brand:"Puma" },
  { id:101, name:"High-Top Basketball Shoes", category:"Shoes", sport:"Basketball", price:7500, oldPrice:9850, discount:24, rating:4.1, reviews:22, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:51, badge:"LIMITED", brand:"Spalding" },
  { id:102, name:"Basketball Jersey Home", category:"Jerseys", sport:"Basketball", price:2950, oldPrice:4100, discount:28, rating:4.1, reviews:285, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:32, badge:"TOP RATED", brand:"KHELZONE" },
  { id:103, name:"Basketball Jersey Away", category:"Jerseys", sport:"Basketball", price:2000, oldPrice:2650, discount:25, rating:4.8, reviews:82, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:32, badge:"", brand:"Nike" },
  { id:104, name:"Basketball Shorts", category:"Apparel", sport:"Basketball", price:3400, oldPrice:4750, discount:28, rating:4.6, reviews:306, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:41, badge:"", brand:"Adidas" },
  { id:105, name:"Basketball Socks Pack of 3", category:"Accessories", sport:"Basketball", price:6400, oldPrice:9200, discount:30, rating:4.8, reviews:333, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:55, badge:"", brand:"Puma" },
  { id:106, name:"Basketball Headband", category:"Accessories", sport:"Basketball", price:9450, oldPrice:12250, discount:23, rating:4.8, reviews:248, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:13, badge:"NEW", brand:"Spalding" },
  { id:107, name:"Basketball Arm Sleeve", category:"Protective Gear", sport:"Basketball", price:9000, oldPrice:11700, discount:23, rating:4.7, reviews:346, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:20, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:108, name:"Basketball Knee Pads", category:"Protective Gear", sport:"Basketball", price:9750, oldPrice:12800, discount:24, rating:4.1, reviews:245, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:7, badge:"SALE", brand:"Nike" },
  { id:109, name:"Basketball Backpack", category:"Bags", sport:"Basketball", price:5900, oldPrice:7350, discount:20, rating:4.2, reviews:296, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:8, badge:"TRENDING", brand:"Adidas" },
  { id:110, name:"Portable Basketball Hoop", category:"Accessories", sport:"Basketball", price:3450, oldPrice:4200, discount:18, rating:4.3, reviews:98, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:48, badge:"LIMITED", brand:"Puma" },
  { id:111, name:"Basketball Pump", category:"Accessories", sport:"Basketball", price:4700, oldPrice:5650, discount:17, rating:4.3, reviews:297, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:32, badge:"TOP RATED", brand:"Spalding" },
  { id:112, name:"Ankle Brace Support", category:"Protective Gear", sport:"Basketball", price:8000, oldPrice:9550, discount:16, rating:4.7, reviews:219, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:52, badge:"", brand:"KHELZONE" },
  { id:113, name:"Basketball Grip Gloves", category:"Gloves", sport:"Basketball", price:10750, oldPrice:15450, discount:30, rating:3.9, reviews:314, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:27, badge:"", brand:"Nike" },
  { id:114, name:"Mini Basketball Hoop", category:"Accessories", sport:"Basketball", price:9000, oldPrice:10650, discount:15, rating:4.3, reviews:219, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:57, badge:"", brand:"Adidas" },
  { id:115, name:"Basketball Training Cones", category:"Accessories", sport:"Basketball", price:8050, oldPrice:10650, discount:24, rating:4.6, reviews:328, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:17, badge:"NEW", brand:"Puma" },
  { id:116, name:"Basketball Wristbands", category:"Accessories", sport:"Basketball", price:9200, oldPrice:11400, discount:19, rating:4.3, reviews:34, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:27, badge:"BEST SELLER", brand:"Spalding" },
  { id:117, name:"Basketball Compression Tights", category:"Apparel", sport:"Basketball", price:6700, oldPrice:9100, discount:26, rating:4.7, reviews:104, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:56, badge:"SALE", brand:"KHELZONE" },
  { id:118, name:"Basketball Warm-Up Jacket", category:"Apparel", sport:"Basketball", price:8850, oldPrice:12650, discount:30, rating:4.9, reviews:293, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:0, badge:"TRENDING", brand:"Nike" },
  { id:119, name:"Basketball Kit Bag", category:"Bags", sport:"Basketball", price:7650, oldPrice:10250, discount:25, rating:4.6, reviews:62, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:44, badge:"LIMITED", brand:"Adidas" },
  { id:120, name:"Rookie Basketball Youth Size", category:"Balls", sport:"Basketball", price:8200, oldPrice:10000, discount:18, rating:4.4, reviews:45, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:19, badge:"TOP RATED", brand:"Puma" },
  { id:121, name:"Basketball Court Shoes Low-Top", category:"Shoes", sport:"Basketball", price:7400, oldPrice:9400, discount:21, rating:4.4, reviews:192, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:51, badge:"", brand:"Spalding" },
  { id:122, name:"Basketball Reversible Jersey", category:"Jerseys", sport:"Basketball", price:7400, oldPrice:9300, discount:20, rating:4.9, reviews:235, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:19, badge:"", brand:"KHELZONE" },
  { id:123, name:"Basketball Team Shorts", category:"Apparel", sport:"Basketball", price:2550, oldPrice:3350, discount:24, rating:4.6, reviews:46, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:25, badge:"", brand:"Nike" },
  { id:124, name:"Basketball Elbow Sleeve", category:"Protective Gear", sport:"Basketball", price:4850, oldPrice:6550, discount:26, rating:4.7, reviews:40, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:51, badge:"NEW", brand:"Adidas" },
  { id:125, name:"Basketball Cap", category:"Accessories", sport:"Basketball", price:1700, oldPrice:2450, discount:31, rating:4.1, reviews:30, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:42, badge:"BEST SELLER", brand:"Puma" },
  { id:126, name:"Basketball Whistle", category:"Accessories", sport:"Basketball", price:3700, oldPrice:4600, discount:20, rating:4.4, reviews:78, image:"https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:39, badge:"SALE", brand:"Spalding" },
  { id:127, name:"Mini Scoreboard", category:"Accessories", sport:"Basketball", price:4750, oldPrice:6200, discount:23, rating:4.2, reviews:208, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:13, badge:"TRENDING", brand:"KHELZONE" },
  { id:128, name:"Pro Grip Basketball", category:"Balls", sport:"Basketball", price:11150, oldPrice:15000, discount:26, rating:4.6, reviews:78, image:"https://images.unsplash.com/photo-1519752593740-59e5b0dee1c1?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:52, badge:"LIMITED", brand:"Nike" },
  { id:129, name:"KHELZONE Match Volleyball", category:"Balls", sport:"Volleyball", price:3500, oldPrice:5050, discount:31, rating:4.0, reviews:33, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:22, badge:"NEW", brand:"KHELZONE" },
  { id:130, name:"Beach Volleyball", category:"Balls", sport:"Volleyball", price:6950, oldPrice:8950, discount:22, rating:4.6, reviews:58, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:40, badge:"BEST SELLER", brand:"Mikasa" },
  { id:131, name:"Indoor Training Volleyball", category:"Balls", sport:"Volleyball", price:4800, oldPrice:5800, discount:17, rating:4.7, reviews:327, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:54, badge:"SALE", brand:"Nike" },
  { id:132, name:"Volleyball Knee Pads", category:"Protective Gear", sport:"Volleyball", price:2800, oldPrice:3900, discount:28, rating:4.5, reviews:41, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:25, badge:"TRENDING", brand:"Decathlon" },
  { id:133, name:"Volleyball Elbow Pads", category:"Protective Gear", sport:"Volleyball", price:7800, oldPrice:10600, discount:26, rating:4.0, reviews:194, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:0, badge:"LIMITED", brand:"Puma" },
  { id:134, name:"Volleyball Shoes", category:"Shoes", sport:"Volleyball", price:7700, oldPrice:10800, discount:29, rating:4.0, reviews:205, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:43, badge:"TOP RATED", brand:"KHELZONE" },
  { id:135, name:"Volleyball Ankle Brace", category:"Protective Gear", sport:"Volleyball", price:8350, oldPrice:11450, discount:27, rating:4.3, reviews:287, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:44, badge:"", brand:"Mikasa" },
  { id:136, name:"Volleyball Jersey", category:"Jerseys", sport:"Volleyball", price:5200, oldPrice:7000, discount:26, rating:4.8, reviews:267, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:32, badge:"", brand:"Nike" },
  { id:137, name:"Volleyball Shorts", category:"Apparel", sport:"Volleyball", price:7950, oldPrice:11150, discount:29, rating:4.5, reviews:185, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:57, badge:"", brand:"Decathlon" },
  { id:138, name:"Portable Volleyball Net", category:"Accessories", sport:"Volleyball", price:4800, oldPrice:6750, discount:29, rating:4.0, reviews:250, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:18, badge:"NEW", brand:"Puma" },
  { id:139, name:"Volleyball Net Set with Poles", category:"Accessories", sport:"Volleyball", price:8400, oldPrice:11200, discount:25, rating:4.6, reviews:192, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:0, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:140, name:"Volleyball Kit Bag", category:"Bags", sport:"Volleyball", price:8900, oldPrice:12550, discount:29, rating:4.1, reviews:128, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:25, badge:"SALE", brand:"Mikasa" },
  { id:141, name:"Volleyball Arm Sleeves", category:"Protective Gear", sport:"Volleyball", price:5050, oldPrice:6400, discount:21, rating:4.8, reviews:161, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:38, badge:"TRENDING", brand:"Nike" },
  { id:142, name:"Volleyball Training Cones", category:"Accessories", sport:"Volleyball", price:950, oldPrice:1250, discount:24, rating:4.1, reviews:143, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:49, badge:"LIMITED", brand:"Decathlon" },
  { id:143, name:"Volleyball Headband", category:"Accessories", sport:"Volleyball", price:7450, oldPrice:9750, discount:24, rating:4.7, reviews:263, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:44, badge:"TOP RATED", brand:"Puma" },
  { id:144, name:"Volleyball Wristband Set", category:"Accessories", sport:"Volleyball", price:8850, oldPrice:11500, discount:23, rating:3.9, reviews:170, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:17, badge:"", brand:"KHELZONE" },
  { id:145, name:"Volleyball Socks", category:"Accessories", sport:"Volleyball", price:7400, oldPrice:10100, discount:27, rating:4.2, reviews:317, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:26, badge:"", brand:"Mikasa" },
  { id:146, name:"Libero Jersey", category:"Jerseys", sport:"Volleyball", price:8550, oldPrice:11350, discount:25, rating:4.2, reviews:301, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:24, badge:"", brand:"Nike" },
  { id:147, name:"Volleyball Warm-Up Jacket", category:"Apparel", sport:"Volleyball", price:6550, oldPrice:8950, discount:27, rating:4.2, reviews:148, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:17, badge:"NEW", brand:"Decathlon" },
  { id:148, name:"Volleyball Compression Sleeve", category:"Protective Gear", sport:"Volleyball", price:2800, oldPrice:3850, discount:27, rating:4.2, reviews:294, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:51, badge:"BEST SELLER", brand:"Puma" },
  { id:149, name:"Volleyball Ball Cart", category:"Accessories", sport:"Volleyball", price:3850, oldPrice:4750, discount:19, rating:4.6, reviews:161, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:49, badge:"SALE", brand:"KHELZONE" },
  { id:150, name:"Volleyball Whistle", category:"Accessories", sport:"Volleyball", price:5450, oldPrice:7850, discount:31, rating:4.7, reviews:171, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:17, badge:"TRENDING", brand:"Mikasa" },
  { id:151, name:"Volleyball Pump", category:"Accessories", sport:"Volleyball", price:6700, oldPrice:8250, discount:19, rating:3.9, reviews:293, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:11, badge:"LIMITED", brand:"Nike" },
  { id:152, name:"Beach Volleyball Shorts", category:"Apparel", sport:"Volleyball", price:5300, oldPrice:6300, discount:16, rating:4.0, reviews:169, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:47, badge:"TOP RATED", brand:"Decathlon" },
  { id:153, name:"Volleyball Court Shoes Low-Top", category:"Shoes", sport:"Volleyball", price:2850, oldPrice:3850, discount:26, rating:4.7, reviews:72, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:58, badge:"", brand:"Puma" },
  { id:154, name:"Volleyball Backpack", category:"Bags", sport:"Volleyball", price:1000, oldPrice:1350, discount:26, rating:4.4, reviews:245, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:24, badge:"", brand:"KHELZONE" },
  { id:155, name:"Volleyball Grip Spray", category:"Accessories", sport:"Volleyball", price:3800, oldPrice:5450, discount:30, rating:4.2, reviews:264, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:10, badge:"", brand:"Mikasa" },
  { id:156, name:"Volleyball Practice Ball Set 6-Pack", category:"Balls", sport:"Volleyball", price:1850, oldPrice:2400, discount:23, rating:4.0, reviews:342, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:46, badge:"NEW", brand:"Nike" },
  { id:157, name:"Referee Stand Flag Set", category:"Accessories", sport:"Volleyball", price:1700, oldPrice:2100, discount:19, rating:4.7, reviews:175, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:8, badge:"BEST SELLER", brand:"Decathlon" },
  { id:158, name:"Volleyball Team Jersey Set", category:"Jerseys", sport:"Volleyball", price:4850, oldPrice:5900, discount:18, rating:4.7, reviews:330, image:"https://images.unsplash.com/photo-1544717684-1243da23b6cd?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:41, badge:"SALE", brand:"Puma" },
  { id:159, name:"Volleyball Visor", category:"Accessories", sport:"Volleyball", price:4500, oldPrice:6250, discount:28, rating:4.3, reviews:246, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:22, badge:"TRENDING", brand:"KHELZONE" },
  { id:160, name:"Junior Volleyball Youth Size", category:"Balls", sport:"Volleyball", price:7800, oldPrice:9850, discount:21, rating:4.5, reviews:332, image:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:50, badge:"LIMITED", brand:"Mikasa" },
  { id:161, name:"Carbon Fibre Badminton Racket", category:"Rackets", sport:"Badminton", price:2200, oldPrice:3150, discount:30, rating:4.1, reviews:128, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:19, badge:"NEW", brand:"KHELZONE" },
  { id:162, name:"Junior Badminton Racket", category:"Rackets", sport:"Badminton", price:1950, oldPrice:2400, discount:19, rating:4.1, reviews:58, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:13, badge:"BEST SELLER", brand:"Yonex" },
  { id:163, name:"Tournament Badminton Racket", category:"Rackets", sport:"Badminton", price:650, oldPrice:850, discount:24, rating:4.6, reviews:260, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:21, badge:"SALE", brand:"Li-Ning" },
  { id:164, name:"Feather Shuttlecocks Tube of 12", category:"Accessories", sport:"Badminton", price:1150, oldPrice:1450, discount:21, rating:4.6, reviews:252, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:7, badge:"TRENDING", brand:"Decathlon" },
  { id:165, name:"Nylon Shuttlecocks Tube of 6", category:"Accessories", sport:"Badminton", price:4400, oldPrice:6300, discount:30, rating:4.7, reviews:340, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:40, badge:"LIMITED", brand:"Nike" },
  { id:166, name:"Badminton Shoes", category:"Shoes", sport:"Badminton", price:3850, oldPrice:5000, discount:23, rating:4.4, reviews:96, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:20, badge:"TOP RATED", brand:"KHELZONE" },
  { id:167, name:"Badminton Kit Bag", category:"Bags", sport:"Badminton", price:2950, oldPrice:3550, discount:17, rating:4.1, reviews:177, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:41, badge:"", brand:"Yonex" },
  { id:168, name:"Badminton Racket Cover", category:"Accessories", sport:"Badminton", price:5350, oldPrice:6950, discount:23, rating:4.4, reviews:175, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:47, badge:"", brand:"Li-Ning" },
  { id:169, name:"Badminton Grip Tape", category:"Accessories", sport:"Badminton", price:7200, oldPrice:10350, discount:30, rating:4.4, reviews:272, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:31, badge:"", brand:"Decathlon" },
  { id:170, name:"Overgrip Pack of 3", category:"Accessories", sport:"Badminton", price:1900, oldPrice:2550, discount:25, rating:4.8, reviews:185, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:41, badge:"NEW", brand:"Nike" },
  { id:171, name:"Badminton Jersey", category:"Jerseys", sport:"Badminton", price:4700, oldPrice:5600, discount:16, rating:4.1, reviews:314, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:40, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:172, name:"Badminton Shorts", category:"Apparel", sport:"Badminton", price:950, oldPrice:1400, discount:32, rating:4.6, reviews:157, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:39, badge:"SALE", brand:"Yonex" },
  { id:173, name:"Badminton Skirt", category:"Apparel", sport:"Badminton", price:1250, oldPrice:1750, discount:29, rating:4.1, reviews:285, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:44, badge:"TRENDING", brand:"Li-Ning" },
  { id:174, name:"Badminton Wristband Set", category:"Accessories", sport:"Badminton", price:7850, oldPrice:11200, discount:30, rating:4.1, reviews:319, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:30, badge:"LIMITED", brand:"Decathlon" },
  { id:175, name:"Badminton Headband", category:"Accessories", sport:"Badminton", price:8650, oldPrice:12450, discount:31, rating:4.4, reviews:229, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:24, badge:"TOP RATED", brand:"Nike" },
  { id:176, name:"Portable Badminton Net", category:"Accessories", sport:"Badminton", price:5850, oldPrice:7950, discount:26, rating:4.8, reviews:188, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:29, badge:"", brand:"KHELZONE" },
  { id:177, name:"Badminton Net Set with Poles", category:"Accessories", sport:"Badminton", price:8700, oldPrice:10950, discount:21, rating:4.8, reviews:301, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:5, badge:"", brand:"Yonex" },
  { id:178, name:"Badminton String Reel", category:"Accessories", sport:"Badminton", price:8050, oldPrice:9700, discount:17, rating:4.2, reviews:79, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:52, badge:"", brand:"Li-Ning" },
  { id:179, name:"Badminton Socks Pack of 3", category:"Accessories", sport:"Badminton", price:7200, oldPrice:10200, discount:29, rating:4.7, reviews:20, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:45, badge:"NEW", brand:"Decathlon" },
  { id:180, name:"Badminton Sports Bag", category:"Bags", sport:"Badminton", price:9500, oldPrice:12400, discount:23, rating:4.0, reviews:285, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:26, badge:"BEST SELLER", brand:"Nike" },
  { id:181, name:"Badminton Racket Bag 6-in-1", category:"Bags", sport:"Badminton", price:8750, oldPrice:11800, discount:26, rating:4.7, reviews:124, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:20, badge:"SALE", brand:"KHELZONE" },
  { id:182, name:"Doubles Badminton Racket", category:"Rackets", sport:"Badminton", price:2750, oldPrice:3950, discount:30, rating:4.3, reviews:268, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:10, badge:"TRENDING", brand:"Yonex" },
  { id:183, name:"Badminton Elbow Support", category:"Protective Gear", sport:"Badminton", price:1050, oldPrice:1500, discount:30, rating:4.5, reviews:142, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:48, badge:"LIMITED", brand:"Li-Ning" },
  { id:184, name:"Badminton Cap", category:"Accessories", sport:"Badminton", price:3200, oldPrice:4050, discount:21, rating:3.9, reviews:228, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:8, badge:"TOP RATED", brand:"Decathlon" },
  { id:185, name:"Badminton Track Jacket", category:"Apparel", sport:"Badminton", price:4300, oldPrice:6250, discount:31, rating:4.8, reviews:256, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:10, badge:"", brand:"Nike" },
  { id:186, name:"Badminton Compression Sleeve", category:"Protective Gear", sport:"Badminton", price:3100, oldPrice:4100, discount:24, rating:4.6, reviews:280, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:48, badge:"", brand:"KHELZONE" },
  { id:187, name:"Badminton Machine Shuttles", category:"Accessories", sport:"Badminton", price:5100, oldPrice:6600, discount:23, rating:4.4, reviews:261, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:18, badge:"", brand:"Yonex" },
  { id:188, name:"Beginner Badminton Set 2 Rackets", category:"Rackets", sport:"Badminton", price:8100, oldPrice:10750, discount:25, rating:4.3, reviews:326, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:35, badge:"NEW", brand:"Li-Ning" },
  { id:189, name:"Badminton Court Shoes Low-Top", category:"Shoes", sport:"Badminton", price:2850, oldPrice:4050, discount:30, rating:4.2, reviews:232, image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:24, badge:"BEST SELLER", brand:"Decathlon" },
  { id:190, name:"Pro Tour Badminton Racket", category:"Rackets", sport:"Badminton", price:8900, oldPrice:11150, discount:20, rating:3.9, reviews:172, image:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80", description:"Precision-tuned frame balancing power and control on every swing.", sizes:["Standard"], stock:56, badge:"SALE", brand:"Nike" },
  { id:191, name:"Badminton Wristband Single", category:"Accessories", sport:"Badminton", price:8600, oldPrice:12150, discount:29, rating:4.3, reviews:267, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:25, badge:"TRENDING", brand:"KHELZONE" },
  { id:192, name:"Badminton Duffel Bag", category:"Bags", sport:"Badminton", price:6050, oldPrice:8050, discount:25, rating:4.4, reviews:253, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:23, badge:"LIMITED", brand:"Yonex" },
  { id:193, name:"KHELZONE Adjustable Dumbbells", category:"Accessories", sport:"Fitness", price:3800, oldPrice:5500, discount:31, rating:4.1, reviews:216, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:17, badge:"NEW", brand:"KHELZONE" },
  { id:194, name:"Fixed Hex Dumbbells Pair", category:"Accessories", sport:"Fitness", price:7450, oldPrice:8900, discount:16, rating:4.6, reviews:215, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:27, badge:"BEST SELLER", brand:"Nike" },
  { id:195, name:"Resistance Bands Set", category:"Accessories", sport:"Fitness", price:3200, oldPrice:4200, discount:24, rating:3.9, reviews:277, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:40, badge:"SALE", brand:"Adidas" },
  { id:196, name:"Pro Gym Training Gloves", category:"Gloves", sport:"Fitness", price:6150, oldPrice:8700, discount:29, rating:4.8, reviews:245, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:9, badge:"TRENDING", brand:"Decathlon" },
  { id:197, name:"Weightlifting Gloves", category:"Gloves", sport:"Fitness", price:9300, oldPrice:13250, discount:30, rating:3.9, reviews:93, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:29, badge:"LIMITED", brand:"Puma" },
  { id:198, name:"Premium Yoga Mat", category:"Accessories", sport:"Fitness", price:3250, oldPrice:3900, discount:17, rating:4.7, reviews:155, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:24, badge:"TOP RATED", brand:"KHELZONE" },
  { id:199, name:"Foam Roller", category:"Accessories", sport:"Fitness", price:10900, oldPrice:14900, discount:27, rating:4.5, reviews:188, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:57, badge:"", brand:"Nike" },
  { id:200, name:"Kettlebell 8kg", category:"Accessories", sport:"Fitness", price:9450, oldPrice:12100, discount:22, rating:4.2, reviews:269, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:58, badge:"", brand:"Adidas" },
  { id:201, name:"Kettlebell 16kg", category:"Accessories", sport:"Fitness", price:9550, oldPrice:11350, discount:16, rating:4.0, reviews:343, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:46, badge:"", brand:"Decathlon" },
  { id:202, name:"Skipping Rope Pro", category:"Accessories", sport:"Fitness", price:5400, oldPrice:7850, discount:31, rating:4.6, reviews:242, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:9, badge:"NEW", brand:"Puma" },
  { id:203, name:"Weighted Skipping Rope", category:"Accessories", sport:"Fitness", price:2350, oldPrice:3050, discount:23, rating:4.6, reviews:34, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:5, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:204, name:"Gym Weight Lifting Belt", category:"Protective Gear", sport:"Fitness", price:6000, oldPrice:8350, discount:28, rating:4.2, reviews:211, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:30, badge:"SALE", brand:"Nike" },
  { id:205, name:"Wrist Wraps Pair", category:"Protective Gear", sport:"Fitness", price:3100, oldPrice:3850, discount:19, rating:4.3, reviews:112, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:13, badge:"TRENDING", brand:"Adidas" },
  { id:206, name:"Knee Sleeves Pair", category:"Protective Gear", sport:"Fitness", price:3550, oldPrice:4250, discount:16, rating:4.8, reviews:337, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:46, badge:"LIMITED", brand:"Decathlon" },
  { id:207, name:"Ab Roller Wheel", category:"Accessories", sport:"Fitness", price:4650, oldPrice:6100, discount:24, rating:4.5, reviews:138, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:32, badge:"TOP RATED", brand:"Puma" },
  { id:208, name:"Push-Up Bars Pair", category:"Accessories", sport:"Fitness", price:4850, oldPrice:6300, discount:23, rating:4.6, reviews:258, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:21, badge:"", brand:"KHELZONE" },
  { id:209, name:"Doorway Pull-Up Bar", category:"Accessories", sport:"Fitness", price:9650, oldPrice:11800, discount:18, rating:4.3, reviews:196, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:40, badge:"", brand:"Nike" },
  { id:210, name:"Gym Duffel Bag", category:"Bags", sport:"Fitness", price:5600, oldPrice:7550, discount:26, rating:4.3, reviews:148, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:32, badge:"", brand:"Adidas" },
  { id:211, name:"Gym Training Shoes", category:"Shoes", sport:"Fitness", price:5650, oldPrice:6950, discount:19, rating:4.3, reviews:267, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:9, badge:"NEW", brand:"Decathlon" },
  { id:212, name:"Compression Gym T-Shirt", category:"Apparel", sport:"Fitness", price:4600, oldPrice:5900, discount:22, rating:4.3, reviews:171, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:47, badge:"BEST SELLER", brand:"Puma" },
  { id:213, name:"Gym Tank Top", category:"Apparel", sport:"Fitness", price:5550, oldPrice:6600, discount:16, rating:4.7, reviews:222, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:20, badge:"SALE", brand:"KHELZONE" },
  { id:214, name:"Gym Track Pants", category:"Apparel", sport:"Fitness", price:850, oldPrice:1150, discount:26, rating:4.6, reviews:45, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:41, badge:"TRENDING", brand:"Nike" },
  { id:215, name:"Gym Shaker Bottle", category:"Accessories", sport:"Fitness", price:8850, oldPrice:12450, discount:29, rating:4.8, reviews:137, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:41, badge:"LIMITED", brand:"Adidas" },
  { id:216, name:"Gym Chalk Pack", category:"Accessories", sport:"Fitness", price:6450, oldPrice:8000, discount:19, rating:4.1, reviews:148, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:46, badge:"TOP RATED", brand:"Decathlon" },
  { id:217, name:"Barbell Collar Clips", category:"Accessories", sport:"Fitness", price:2950, oldPrice:4000, discount:26, rating:4.8, reviews:350, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:5, badge:"", brand:"Puma" },
  { id:218, name:"Adjustable Weight Bench", category:"Accessories", sport:"Fitness", price:5750, oldPrice:8000, discount:28, rating:3.9, reviews:206, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:49, badge:"", brand:"KHELZONE" },
  { id:219, name:"Battle Rope", category:"Accessories", sport:"Fitness", price:2850, oldPrice:3450, discount:17, rating:4.2, reviews:232, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:14, badge:"", brand:"Nike" },
  { id:220, name:"Gym Sweat Towel", category:"Accessories", sport:"Fitness", price:4000, oldPrice:4850, discount:18, rating:4.4, reviews:207, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:36, badge:"NEW", brand:"Adidas" },
  { id:221, name:"Gym Cap", category:"Accessories", sport:"Fitness", price:8900, oldPrice:12700, discount:30, rating:4.7, reviews:151, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:55, badge:"BEST SELLER", brand:"Decathlon" },
  { id:222, name:"Gym Backpack", category:"Bags", sport:"Fitness", price:8600, oldPrice:12400, discount:31, rating:4.2, reviews:193, image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:54, badge:"SALE", brand:"Puma" },
  { id:223, name:"Resistance Loop Bands Set of 5", category:"Accessories", sport:"Fitness", price:2600, oldPrice:3400, discount:24, rating:4.0, reviews:135, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:58, badge:"TRENDING", brand:"KHELZONE" },
  { id:224, name:"Gym Wrist Support Gloves", category:"Gloves", sport:"Fitness", price:7200, oldPrice:10400, discount:31, rating:4.7, reviews:207, image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:8, badge:"LIMITED", brand:"Nike" },
  { id:225, name:"KHELZONE Road Running Shoes", category:"Shoes", sport:"Running", price:7650, oldPrice:9050, discount:15, rating:4.4, reviews:252, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:26, badge:"NEW", brand:"KHELZONE" },
  { id:226, name:"Trail Running Shoes", category:"Shoes", sport:"Running", price:12200, oldPrice:16850, discount:28, rating:4.2, reviews:215, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:55, badge:"BEST SELLER", brand:"Nike" },
  { id:227, name:"Marathon Racing Shoes", category:"Shoes", sport:"Running", price:11650, oldPrice:16700, discount:30, rating:4.0, reviews:139, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:33, badge:"SALE", brand:"Adidas" },
  { id:228, name:"Lightweight Training Shoes", category:"Shoes", sport:"Running", price:1600, oldPrice:2150, discount:26, rating:4.8, reviews:187, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:42, badge:"TRENDING", brand:"Puma" },
  { id:229, name:"Running Shorts", category:"Apparel", sport:"Running", price:4850, oldPrice:6550, discount:26, rating:4.5, reviews:257, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:47, badge:"LIMITED", brand:"Decathlon" },
  { id:230, name:"Running Tights", category:"Apparel", sport:"Running", price:6150, oldPrice:8350, discount:26, rating:4.0, reviews:43, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:5, badge:"TOP RATED", brand:"KHELZONE" },
  { id:231, name:"Moisture-Wicking Running Tee", category:"Apparel", sport:"Running", price:6200, oldPrice:9000, discount:31, rating:4.0, reviews:140, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:59, badge:"", brand:"Nike" },
  { id:232, name:"Windproof Running Jacket", category:"Apparel", sport:"Running", price:10000, oldPrice:12150, discount:18, rating:4.4, reviews:296, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:29, badge:"", brand:"Adidas" },
  { id:233, name:"Running Cap", category:"Accessories", sport:"Running", price:10800, oldPrice:14900, discount:28, rating:4.1, reviews:232, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:44, badge:"", brand:"Puma" },
  { id:234, name:"Running Visor", category:"Accessories", sport:"Running", price:2800, oldPrice:3950, discount:29, rating:4.5, reviews:163, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:5, badge:"NEW", brand:"Decathlon" },
  { id:235, name:"Hydration Running Belt", category:"Accessories", sport:"Running", price:12500, oldPrice:16000, discount:22, rating:4.3, reviews:140, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:57, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:236, name:"Running Phone Armband", category:"Accessories", sport:"Running", price:7150, oldPrice:8650, discount:17, rating:4.6, reviews:298, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:44, badge:"SALE", brand:"Nike" },
  { id:237, name:"Running Socks Pack of 3", category:"Accessories", sport:"Running", price:7100, oldPrice:8500, discount:16, rating:4.2, reviews:82, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:57, badge:"TRENDING", brand:"Adidas" },
  { id:238, name:"Compression Calf Sleeves", category:"Protective Gear", sport:"Running", price:8650, oldPrice:10400, discount:17, rating:4.1, reviews:347, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:41, badge:"LIMITED", brand:"Puma" },
  { id:239, name:"Reflective Running Vest", category:"Accessories", sport:"Running", price:1550, oldPrice:1850, discount:16, rating:4.2, reviews:84, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:53, badge:"TOP RATED", brand:"Decathlon" },
  { id:240, name:"Running Sunglasses", category:"Accessories", sport:"Running", price:10450, oldPrice:12900, discount:19, rating:4.7, reviews:303, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:16, badge:"", brand:"KHELZONE" },
  { id:241, name:"Hydration Running Backpack", category:"Bags", sport:"Running", price:10800, oldPrice:13350, discount:19, rating:4.8, reviews:188, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:52, badge:"", brand:"Nike" },
  { id:242, name:"GPS Watch Band", category:"Accessories", sport:"Running", price:3600, oldPrice:5000, discount:28, rating:4.5, reviews:161, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:57, badge:"", brand:"Adidas" },
  { id:243, name:"Winter Running Gloves", category:"Gloves", sport:"Running", price:3550, oldPrice:5150, discount:31, rating:4.4, reviews:109, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:10, badge:"NEW", brand:"Puma" },
  { id:244, name:"Running Headband", category:"Accessories", sport:"Running", price:12050, oldPrice:17050, discount:29, rating:4.0, reviews:203, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:53, badge:"BEST SELLER", brand:"Decathlon" },
  { id:245, name:"Blister Prevention Tape", category:"Accessories", sport:"Running", price:5100, oldPrice:6850, discount:26, rating:3.9, reviews:155, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:6, badge:"SALE", brand:"KHELZONE" },
  { id:246, name:"Running Insoles", category:"Accessories", sport:"Running", price:3300, oldPrice:4550, discount:27, rating:4.4, reviews:52, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:33, badge:"TRENDING", brand:"Nike" },
  { id:247, name:"Recovery Foam Roller", category:"Accessories", sport:"Running", price:8550, oldPrice:11900, discount:28, rating:4.4, reviews:75, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:31, badge:"LIMITED", brand:"Adidas" },
  { id:248, name:"Running Waist Pouch", category:"Bags", sport:"Running", price:9450, oldPrice:11700, discount:19, rating:4.5, reviews:286, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:22, badge:"TOP RATED", brand:"Puma" },
  { id:249, name:"Night Running LED Clip", category:"Accessories", sport:"Running", price:8700, oldPrice:11800, discount:26, rating:3.9, reviews:265, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:57, badge:"", brand:"Decathlon" },
  { id:250, name:"Running Water Bottle", category:"Accessories", sport:"Running", price:7800, oldPrice:10100, discount:23, rating:4.0, reviews:247, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:7, badge:"", brand:"KHELZONE" },
  { id:251, name:"Running Beanie", category:"Accessories", sport:"Running", price:2500, oldPrice:3150, discount:21, rating:4.0, reviews:84, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:20, badge:"", brand:"Nike" },
  { id:252, name:"Ultra Marathon Shoes", category:"Shoes", sport:"Running", price:11450, oldPrice:15450, discount:26, rating:4.4, reviews:186, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:27, badge:"NEW", brand:"Adidas" },
  { id:253, name:"Kids Running Shoes", category:"Shoes", sport:"Running", price:11000, oldPrice:14550, discount:24, rating:4.4, reviews:329, image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:30, badge:"BEST SELLER", brand:"Puma" },
  { id:254, name:"Running Base Layer", category:"Apparel", sport:"Running", price:2800, oldPrice:3900, discount:28, rating:4.0, reviews:302, image:"https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:49, badge:"SALE", brand:"Decathlon" },
  { id:255, name:"Trail Running Vest Backpack", category:"Bags", sport:"Running", price:4700, oldPrice:6100, discount:23, rating:4.8, reviews:231, image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:24, badge:"TRENDING", brand:"KHELZONE" },
  { id:256, name:"Recovery Slides", category:"Shoes", sport:"Running", price:8650, oldPrice:11150, discount:22, rating:4.6, reviews:180, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:30, badge:"LIMITED", brand:"Nike" },
  { id:257, name:"KHELZONE Pro Boxing Gloves", category:"Gloves", sport:"Boxing", price:6000, oldPrice:8150, discount:26, rating:4.3, reviews:98, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:46, badge:"NEW", brand:"KHELZONE" },
  { id:258, name:"Training Boxing Gloves", category:"Gloves", sport:"Boxing", price:8650, oldPrice:10350, discount:16, rating:4.7, reviews:67, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:30, badge:"BEST SELLER", brand:"Everlast" },
  { id:259, name:"Sparring Boxing Gloves", category:"Gloves", sport:"Boxing", price:2500, oldPrice:3450, discount:28, rating:4.3, reviews:86, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:38, badge:"SALE", brand:"Nike" },
  { id:260, name:"Bag Gloves", category:"Gloves", sport:"Boxing", price:1900, oldPrice:2550, discount:25, rating:4.5, reviews:188, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:45, badge:"TRENDING", brand:"Decathlon" },
  { id:261, name:"Boxing Hand Wraps", category:"Protective Gear", sport:"Boxing", price:2900, oldPrice:3750, discount:23, rating:4.8, reviews:236, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:58, badge:"LIMITED", brand:"Adidas" },
  { id:262, name:"Boxing Headgear", category:"Protective Gear", sport:"Boxing", price:1750, oldPrice:2500, discount:30, rating:4.5, reviews:200, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:9, badge:"TOP RATED", brand:"KHELZONE" },
  { id:263, name:"Boxing Mouthguard", category:"Protective Gear", sport:"Boxing", price:10350, oldPrice:13650, discount:24, rating:4.1, reviews:266, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:17, badge:"", brand:"Everlast" },
  { id:264, name:"Groin Guard", category:"Protective Gear", sport:"Boxing", price:2650, oldPrice:3400, discount:22, rating:4.5, reviews:78, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:51, badge:"", brand:"Nike" },
  { id:265, name:"Heavy Punching Bag", category:"Accessories", sport:"Boxing", price:5450, oldPrice:7300, discount:25, rating:4.7, reviews:307, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:52, badge:"", brand:"Decathlon" },
  { id:266, name:"Free Standing Punching Bag", category:"Accessories", sport:"Boxing", price:11100, oldPrice:14950, discount:26, rating:4.5, reviews:33, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:41, badge:"NEW", brand:"Adidas" },
  { id:267, name:"Speed Bag", category:"Accessories", sport:"Boxing", price:11700, oldPrice:16450, discount:29, rating:4.2, reviews:112, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:20, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:268, name:"Double End Bag", category:"Accessories", sport:"Boxing", price:5950, oldPrice:8500, discount:30, rating:4.3, reviews:112, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:58, badge:"SALE", brand:"Everlast" },
  { id:269, name:"Focus Mitts Pair", category:"Accessories", sport:"Boxing", price:3250, oldPrice:4350, discount:25, rating:4.3, reviews:92, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:50, badge:"TRENDING", brand:"Nike" },
  { id:270, name:"Boxing Shoes", category:"Shoes", sport:"Boxing", price:11250, oldPrice:16250, discount:31, rating:4.0, reviews:291, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:16, badge:"LIMITED", brand:"Decathlon" },
  { id:271, name:"Boxing Shorts", category:"Apparel", sport:"Boxing", price:7050, oldPrice:9100, discount:23, rating:4.2, reviews:209, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:22, badge:"TOP RATED", brand:"Adidas" },
  { id:272, name:"Boxing Robe", category:"Apparel", sport:"Boxing", price:6200, oldPrice:8600, discount:28, rating:4.5, reviews:63, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:59, badge:"", brand:"KHELZONE" },
  { id:273, name:"Boxing Rash Guard", category:"Apparel", sport:"Boxing", price:1750, oldPrice:2150, discount:19, rating:4.7, reviews:45, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:46, badge:"", brand:"Everlast" },
  { id:274, name:"Boxing Skipping Rope", category:"Accessories", sport:"Boxing", price:2250, oldPrice:2800, discount:20, rating:4.6, reviews:268, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:41, badge:"", brand:"Nike" },
  { id:275, name:"Boxing Gym Bag", category:"Bags", sport:"Boxing", price:8150, oldPrice:10550, discount:23, rating:4.1, reviews:282, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:10, badge:"NEW", brand:"Decathlon" },
  { id:276, name:"Ankle Support Wraps", category:"Protective Gear", sport:"Boxing", price:6550, oldPrice:8500, discount:23, rating:4.2, reviews:323, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:34, badge:"BEST SELLER", brand:"Adidas" },
  { id:277, name:"Kids Boxing Gloves", category:"Gloves", sport:"Boxing", price:9550, oldPrice:13000, discount:27, rating:3.9, reviews:222, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:41, badge:"SALE", brand:"KHELZONE" },
  { id:278, name:"Muay Thai Shin Guards", category:"Protective Gear", sport:"Boxing", price:1800, oldPrice:2150, discount:16, rating:4.2, reviews:128, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:52, badge:"TRENDING", brand:"Everlast" },
  { id:279, name:"Boxing Belly Pad", category:"Accessories", sport:"Boxing", price:3150, oldPrice:4350, discount:28, rating:4.2, reviews:81, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:0, badge:"LIMITED", brand:"Nike" },
  { id:280, name:"Boxing Elbow Pads", category:"Protective Gear", sport:"Boxing", price:9050, oldPrice:12500, discount:28, rating:4.1, reviews:214, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:37, badge:"TOP RATED", brand:"Decathlon" },
  { id:281, name:"Junior Boxing Training Gloves", category:"Gloves", sport:"Boxing", price:4650, oldPrice:6100, discount:24, rating:4.7, reviews:201, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:7, badge:"", brand:"Adidas" },
  { id:282, name:"MMA Gloves", category:"Gloves", sport:"Boxing", price:7400, oldPrice:10450, discount:29, rating:3.9, reviews:29, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:32, badge:"", brand:"KHELZONE" },
  { id:283, name:"Boxing Ring Wraps", category:"Accessories", sport:"Boxing", price:2200, oldPrice:3100, discount:29, rating:4.5, reviews:313, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:28, badge:"", brand:"Everlast" },
  { id:284, name:"Boxing Water Bottle", category:"Accessories", sport:"Boxing", price:11400, oldPrice:14750, discount:23, rating:4.0, reviews:30, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:23, badge:"NEW", brand:"Nike" },
  { id:285, name:"Boxing Towel", category:"Accessories", sport:"Boxing", price:3700, oldPrice:5150, discount:28, rating:4.5, reviews:205, image:"https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:8, badge:"BEST SELLER", brand:"Decathlon" },
  { id:286, name:"Weighted Boxing Vest", category:"Accessories", sport:"Boxing", price:8050, oldPrice:11350, discount:29, rating:4.1, reviews:321, image:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:28, badge:"SALE", brand:"Adidas" },
  { id:287, name:"Boxing Headband", category:"Accessories", sport:"Boxing", price:9500, oldPrice:11400, discount:17, rating:4.8, reviews:193, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:17, badge:"TRENDING", brand:"KHELZONE" },
  { id:288, name:"Pro Fight Gloves", category:"Gloves", sport:"Boxing", price:6350, oldPrice:8850, discount:28, rating:4.0, reviews:344, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:10, badge:"LIMITED", brand:"Everlast" },
  { id:289, name:"KHELZONE Field Hockey Stick", category:"Sticks", sport:"Hockey", price:10200, oldPrice:13450, discount:24, rating:4.8, reviews:198, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Composite build engineered for touch, strength and stick-handling control.", sizes:["Junior","Standard"], stock:25, badge:"NEW", brand:"KHELZONE" },
  { id:290, name:"Composite Hockey Stick", category:"Sticks", sport:"Hockey", price:13400, oldPrice:19300, discount:31, rating:4.5, reviews:95, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Composite build engineered for touch, strength and stick-handling control.", sizes:["Junior","Standard"], stock:18, badge:"BEST SELLER", brand:"Decathlon" },
  { id:291, name:"Junior Hockey Stick", category:"Sticks", sport:"Hockey", price:3200, oldPrice:3900, discount:18, rating:4.1, reviews:328, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Composite build engineered for touch, strength and stick-handling control.", sizes:["Junior","Standard"], stock:12, badge:"SALE", brand:"Nike" },
  { id:292, name:"Goalkeeper Hockey Stick", category:"Sticks", sport:"Hockey", price:13950, oldPrice:19300, discount:28, rating:4.0, reviews:341, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Composite build engineered for touch, strength and stick-handling control.", sizes:["Junior","Standard"], stock:34, badge:"TRENDING", brand:"Adidas" },
  { id:293, name:"Hockey Match Ball", category:"Balls", sport:"Hockey", price:9100, oldPrice:12600, discount:28, rating:4.7, reviews:249, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:46, badge:"LIMITED", brand:"Puma" },
  { id:294, name:"Hockey Training Ball", category:"Balls", sport:"Hockey", price:10750, oldPrice:14550, discount:26, rating:4.9, reviews:185, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Match-grade construction built for consistent performance every session.", sizes:["Standard"], stock:58, badge:"TOP RATED", brand:"KHELZONE" },
  { id:295, name:"Hockey Shin Guards", category:"Protective Gear", sport:"Hockey", price:11800, oldPrice:14950, discount:21, rating:4.3, reviews:260, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:31, badge:"", brand:"Decathlon" },
  { id:296, name:"Hockey Gloves", category:"Gloves", sport:"Hockey", price:11850, oldPrice:14950, discount:21, rating:4.2, reviews:48, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:25, badge:"", brand:"Nike" },
  { id:297, name:"Goalkeeper Kickers", category:"Protective Gear", sport:"Hockey", price:9800, oldPrice:11750, discount:17, rating:4.4, reviews:39, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:6, badge:"", brand:"Adidas" },
  { id:298, name:"Goalkeeper Leg Guards", category:"Protective Gear", sport:"Hockey", price:7550, oldPrice:10600, discount:29, rating:4.0, reviews:66, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:42, badge:"NEW", brand:"Puma" },
  { id:299, name:"Goalkeeper Helmet", category:"Protective Gear", sport:"Hockey", price:11250, oldPrice:14800, discount:24, rating:4.4, reviews:303, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:53, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:300, name:"Hockey Mouthguard", category:"Protective Gear", sport:"Hockey", price:13600, oldPrice:19350, discount:30, rating:4.3, reviews:312, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:44, badge:"SALE", brand:"Decathlon" },
  { id:301, name:"Hockey Turf Shoes", category:"Shoes", sport:"Hockey", price:4600, oldPrice:5850, discount:21, rating:4.4, reviews:97, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Supportive outsole and breathable upper built for explosive movement.", sizes:["S","M","L","XL"], stock:6, badge:"TRENDING", brand:"Nike" },
  { id:302, name:"Hockey Jersey", category:"Jerseys", sport:"Hockey", price:8900, oldPrice:10750, discount:17, rating:4.8, reviews:195, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:48, badge:"LIMITED", brand:"Adidas" },
  { id:303, name:"Hockey Shorts", category:"Apparel", sport:"Hockey", price:2900, oldPrice:3800, discount:24, rating:4.1, reviews:146, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:48, badge:"TOP RATED", brand:"Puma" },
  { id:304, name:"Hockey Socks", category:"Accessories", sport:"Hockey", price:8650, oldPrice:12500, discount:31, rating:4.4, reviews:332, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:13, badge:"", brand:"KHELZONE" },
  { id:305, name:"Hockey Kit Bag", category:"Bags", sport:"Hockey", price:7450, oldPrice:9550, discount:22, rating:4.2, reviews:229, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:52, badge:"", brand:"Decathlon" },
  { id:306, name:"Hockey Stick Bag", category:"Bags", sport:"Hockey", price:7050, oldPrice:9600, discount:27, rating:4.0, reviews:343, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:44, badge:"", brand:"Nike" },
  { id:307, name:"Hockey Grip Tape", category:"Accessories", sport:"Hockey", price:7000, oldPrice:8400, discount:17, rating:4.0, reviews:217, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:21, badge:"NEW", brand:"Adidas" },
  { id:308, name:"Hockey Stick Repair Kit", category:"Accessories", sport:"Hockey", price:5650, oldPrice:7750, discount:27, rating:4.6, reviews:328, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:58, badge:"BEST SELLER", brand:"Puma" },
  { id:309, name:"Goalkeeper Chest Guard", category:"Protective Gear", sport:"Hockey", price:3950, oldPrice:5000, discount:21, rating:4.5, reviews:92, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:25, badge:"SALE", brand:"KHELZONE" },
  { id:310, name:"Goalkeeper Elbow Guards", category:"Protective Gear", sport:"Hockey", price:6600, oldPrice:9500, discount:31, rating:4.6, reviews:220, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:11, badge:"TRENDING", brand:"Decathlon" },
  { id:311, name:"Hockey Captain's Armband", category:"Accessories", sport:"Hockey", price:11250, oldPrice:15450, discount:27, rating:4.0, reviews:306, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:27, badge:"LIMITED", brand:"Nike" },
  { id:312, name:"Hockey Training Cones", category:"Accessories", sport:"Hockey", price:12050, oldPrice:16800, discount:28, rating:4.7, reviews:289, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:8, badge:"TOP RATED", brand:"Adidas" },
  { id:313, name:"Hockey Whistle", category:"Accessories", sport:"Hockey", price:12100, oldPrice:16450, discount:26, rating:4.4, reviews:29, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:26, badge:"", brand:"Puma" },
  { id:314, name:"Hockey Warm-Up Jacket", category:"Apparel", sport:"Hockey", price:6550, oldPrice:8050, discount:19, rating:4.1, reviews:268, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:15, badge:"", brand:"KHELZONE" },
  { id:315, name:"Ice Hockey Stick", category:"Sticks", sport:"Hockey", price:5200, oldPrice:7550, discount:31, rating:4.1, reviews:171, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Composite build engineered for touch, strength and stick-handling control.", sizes:["Junior","Standard"], stock:57, badge:"", brand:"Decathlon" },
  { id:316, name:"Ice Hockey Gloves", category:"Gloves", sport:"Hockey", price:14400, oldPrice:17400, discount:17, rating:4.7, reviews:289, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Reinforced padding and grip for confident handling under pressure.", sizes:["S","M","L"], stock:5, badge:"NEW", brand:"Nike" },
  { id:317, name:"Ice Hockey Helmet", category:"Protective Gear", sport:"Hockey", price:12350, oldPrice:15700, discount:21, rating:4.7, reviews:87, image:"https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:41, badge:"BEST SELLER", brand:"Adidas" },
  { id:318, name:"Ice Hockey Puck Pack of 3", category:"Accessories", sport:"Hockey", price:7650, oldPrice:9350, discount:18, rating:4.1, reviews:339, image:"https://images.unsplash.com/photo-1607923432780-810852a4d798?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:54, badge:"SALE", brand:"Puma" },
  { id:319, name:"Hockey Water Bottle", category:"Accessories", sport:"Hockey", price:4200, oldPrice:5750, discount:27, rating:3.9, reviews:206, image:"https://images.unsplash.com/photo-1600679472233-53afb75d3762?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:46, badge:"TRENDING", brand:"KHELZONE" },
  { id:320, name:"Hockey Team Jersey Set", category:"Jerseys", sport:"Hockey", price:13300, oldPrice:16550, discount:20, rating:4.3, reviews:165, image:"https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80", description:"Moisture-wicking fabric with a locker-room fit for match day.", sizes:["XS","S","M","L","XL","XXL"], stock:51, badge:"LIMITED", brand:"Decathlon" },
  { id:321, name:"KHELZONE Sports Duffel Bag", category:"Bags", sport:"Accessories", price:4100, oldPrice:5100, discount:20, rating:4.1, reviews:260, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:56, badge:"NEW", brand:"KHELZONE" },
  { id:322, name:"Multi-Sport Backpack", category:"Bags", sport:"Accessories", price:2000, oldPrice:2550, discount:22, rating:4.8, reviews:245, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:32, badge:"BEST SELLER", brand:"Nike" },
  { id:323, name:"Sports Water Bottle 1L", category:"Accessories", sport:"Accessories", price:2700, oldPrice:3750, discount:28, rating:4.4, reviews:234, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:13, badge:"SALE", brand:"Adidas" },
  { id:324, name:"Insulated Water Bottle", category:"Accessories", sport:"Accessories", price:2050, oldPrice:2850, discount:28, rating:4.0, reviews:148, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:6, badge:"TRENDING", brand:"Puma" },
  { id:325, name:"Sports Towel", category:"Accessories", sport:"Accessories", price:5650, oldPrice:7400, discount:24, rating:4.3, reviews:72, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:48, badge:"LIMITED", brand:"Decathlon" },
  { id:326, name:"Sweatband Set", category:"Accessories", sport:"Accessories", price:4650, oldPrice:6550, discount:29, rating:4.2, reviews:102, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:20, badge:"TOP RATED", brand:"KHELZONE" },
  { id:327, name:"Sports Cap", category:"Accessories", sport:"Accessories", price:4100, oldPrice:5850, discount:30, rating:4.0, reviews:243, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:8, badge:"", brand:"Nike" },
  { id:328, name:"Sports Sunglasses", category:"Accessories", sport:"Accessories", price:2200, oldPrice:3100, discount:29, rating:4.8, reviews:33, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:29, badge:"", brand:"Adidas" },
  { id:329, name:"Compression Ankle Support", category:"Protective Gear", sport:"Accessories", price:850, oldPrice:1100, discount:23, rating:4.3, reviews:217, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:8, badge:"", brand:"Puma" },
  { id:330, name:"Compression Knee Support", category:"Protective Gear", sport:"Accessories", price:3450, oldPrice:4300, discount:20, rating:4.2, reviews:70, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:56, badge:"NEW", brand:"Decathlon" },
  { id:331, name:"Elastic Sports Tape", category:"Accessories", sport:"Accessories", price:5700, oldPrice:7250, discount:21, rating:4.0, reviews:39, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:21, badge:"BEST SELLER", brand:"KHELZONE" },
  { id:332, name:"First Aid Sports Kit", category:"Accessories", sport:"Accessories", price:4250, oldPrice:5800, discount:27, rating:4.0, reviews:260, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:31, badge:"SALE", brand:"Nike" },
  { id:333, name:"Sports Whistle", category:"Accessories", sport:"Accessories", price:5450, oldPrice:6450, discount:16, rating:4.0, reviews:151, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:16, badge:"TRENDING", brand:"Adidas" },
  { id:334, name:"Sports Stopwatch", category:"Accessories", sport:"Accessories", price:1600, oldPrice:2150, discount:26, rating:4.6, reviews:290, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:30, badge:"LIMITED", brand:"Puma" },
  { id:335, name:"Sports Wrist Watch", category:"Accessories", sport:"Accessories", price:1300, oldPrice:1800, discount:28, rating:4.1, reviews:82, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:6, badge:"TOP RATED", brand:"Decathlon" },
  { id:336, name:"Gym Locker Bag", category:"Bags", sport:"Accessories", price:2350, oldPrice:3050, discount:23, rating:4.7, reviews:254, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:7, badge:"", brand:"KHELZONE" },
  { id:337, name:"Shoe Deodorizer Spray", category:"Accessories", sport:"Accessories", price:1300, oldPrice:1850, discount:30, rating:4.4, reviews:294, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:0, badge:"", brand:"Nike" },
  { id:338, name:"Sports Socks Pack of 5", category:"Accessories", sport:"Accessories", price:5600, oldPrice:7400, discount:24, rating:4.1, reviews:93, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:21, badge:"", brand:"Adidas" },
  { id:339, name:"Training Cone Set 10 Pack", category:"Accessories", sport:"Accessories", price:3900, oldPrice:4600, discount:15, rating:4.3, reviews:312, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:29, badge:"NEW", brand:"Puma" },
  { id:340, name:"Speed Agility Ladder", category:"Accessories", sport:"Accessories", price:1950, oldPrice:2650, discount:26, rating:4.0, reviews:204, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:7, badge:"BEST SELLER", brand:"Decathlon" },
  { id:341, name:"Resistance Parachute", category:"Accessories", sport:"Accessories", price:4700, oldPrice:6250, discount:25, rating:4.7, reviews:279, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:38, badge:"SALE", brand:"KHELZONE" },
  { id:342, name:"Sports Umbrella", category:"Accessories", sport:"Accessories", price:550, oldPrice:700, discount:21, rating:4.4, reviews:345, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:27, badge:"TRENDING", brand:"Nike" },
  { id:343, name:"Portable Sports Speaker", category:"Accessories", sport:"Accessories", price:3450, oldPrice:4300, discount:20, rating:3.9, reviews:54, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:25, badge:"LIMITED", brand:"Adidas" },
  { id:344, name:"Fitness Tracker Band", category:"Accessories", sport:"Accessories", price:2400, oldPrice:3300, discount:27, rating:4.5, reviews:317, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:50, badge:"TOP RATED", brand:"Puma" },
  { id:345, name:"Sports Headphones", category:"Accessories", sport:"Accessories", price:3100, oldPrice:3750, discount:17, rating:4.3, reviews:193, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:55, badge:"", brand:"Decathlon" },
  { id:346, name:"Shoe Bag", category:"Bags", sport:"Accessories", price:5650, oldPrice:6950, discount:19, rating:4.7, reviews:257, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:47, badge:"", brand:"KHELZONE" },
  { id:347, name:"Team Kit Organizer Bag", category:"Bags", sport:"Accessories", price:4300, oldPrice:5800, discount:26, rating:4.7, reviews:52, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Durable, weather-resistant construction with dedicated gear compartments.", sizes:["Standard"], stock:48, badge:"", brand:"Nike" },
  { id:348, name:"Sports Cooling Towel", category:"Accessories", sport:"Accessories", price:4150, oldPrice:4950, discount:16, rating:4.1, reviews:122, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:59, badge:"NEW", brand:"Adidas" },
  { id:349, name:"Adjustable Sports Face Cap", category:"Accessories", sport:"Accessories", price:750, oldPrice:950, discount:21, rating:4.2, reviews:223, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:55, badge:"BEST SELLER", brand:"Puma" },
  { id:350, name:"Multi-Sport Training Vest", category:"Apparel", sport:"Accessories", price:4850, oldPrice:6350, discount:24, rating:3.9, reviews:117, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", description:"Breathable performance fabric built for training and match day alike.", sizes:["XS","S","M","L","XL"], stock:21, badge:"SALE", brand:"Decathlon" },
  { id:351, name:"Sports Wristbands Pack of 2", category:"Accessories", sport:"Accessories", price:3300, oldPrice:4650, discount:29, rating:3.9, reviews:189, image:"https://images.unsplash.com/photo-1602087113230-77bcc3a0d4b4?w=600&q=80", description:"Essential gear that rounds out a complete training setup.", sizes:["Standard"], stock:20, badge:"TRENDING", brand:"KHELZONE" },
  { id:352, name:"Universal Mouthguard", category:"Protective Gear", sport:"Accessories", price:1400, oldPrice:1950, discount:28, rating:4.3, reviews:224, image:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80", description:"Lightweight protective build that doesn't compromise on mobility.", sizes:["S","M","L"], stock:50, badge:"LIMITED", brand:"Nike" },
];

function fallbackImgFor(sport){
  const label = (sport || "KHELZONE").toString().toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#141414"/><rect x="10" y="10" width="380" height="380" fill="none" stroke="#FF6A00" stroke-width="2"/><line x1="10" y1="330" x2="390" y2="330" stroke="#FF6A00" stroke-width="1" opacity="0.5"/><text x="50%" y="47%" fill="#FF6A00" font-family="Arial, sans-serif" font-weight="800" font-size="28" text-anchor="middle" letter-spacing="1">KHELZONE</text><text x="50%" y="56%" fill="#A6A6A6" font-family="Arial, sans-serif" font-size="13" text-anchor="middle" letter-spacing="3">${label}</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}
const FALLBACK_IMG = fallbackImgFor("KHELZONE");

const TRENDING_IDS = [2, 6, 11, 15, 20, 24];

/* ---------------------------------------------------------------------- *
 * 2. STATE
 * ---------------------------------------------------------------------- */
const state = {
  search:"",
  sports:new Set(),
  types:new Set(),
  priceMax:20000,
  priceBuckets:new Set(),
  brands:new Set(),
  sizes:new Set(),
  minRating:0,
  sort:"featured",
  view:"grid",
  visibleCount:12,
  cart: JSON.parse(localStorage.getItem("khz_cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("khz_wishlist") || "[]")
};

/* ---------------------------------------------------------------------- *
 * 3. HELPERS
 * ---------------------------------------------------------------------- */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const money = n => "Rs. " + n.toLocaleString("en-PK");

function saveCart(){ localStorage.setItem("khz_cart", JSON.stringify(state.cart)); }
function saveWishlist(){ localStorage.setItem("khz_wishlist", JSON.stringify(state.wishlist)); }

function starString(rating){
  let out = "";
  for(let i=1;i<=5;i++){
    out += `<svg class="rating-star ${i<=Math.round(rating)?"":"empty"}" width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/></svg>`;
  }
  return out;
}

function badgeClass(badge){
  switch(badge){
    case "NEW": return "badge-new";
    case "SALE": return "badge-sale";
    case "BEST SELLER": return "badge-best";
    case "TRENDING": return "badge-trend";
    case "LIMITED": return "badge-limited";
    case "TOP RATED": return "badge-top";
    default: return "";
  }
}

/* ---------------------------------------------------------------------- *
 * 4. FILTERING / SORTING
 * ---------------------------------------------------------------------- */
function priceInBucket(price, bucket){
  if(bucket === "u2000") return price < 2000;
  if(bucket === "2000-5000") return price >= 2000 && price <= 5000;
  if(bucket === "5000-10000") return price > 5000 && price <= 10000;
  if(bucket === "a10000") return price > 10000;
  return true;
}

function getFilteredProducts(){
  let list = PRODUCTS.filter(p => {
    if(state.search){
      const q = state.search.toLowerCase();
      const hay = `${p.name} ${p.category} ${p.sport} ${p.description} ${p.brand}`.toLowerCase();
      if(!hay.includes(q)) return false;
    }
    if(state.sports.size && !state.sports.has(p.sport)) return false;
    if(state.types.size && !state.types.has(p.category)) return false;
    if(p.price > state.priceMax) return false;
    if(state.priceBuckets.size){
      const ok = [...state.priceBuckets].some(b => priceInBucket(p.price, b));
      if(!ok) return false;
    }
    if(state.brands.size && !state.brands.has(p.brand)) return false;
    if(state.sizes.size){
      const ok = p.sizes.some(s => state.sizes.has(s));
      if(!ok) return false;
    }
    if(state.minRating && p.rating < state.minRating) return false;
    return true;
  });

  switch(state.sort){
    case "popular": list.sort((a,b)=> b.reviews - a.reviews); break;
    case "newest": list.sort((a,b)=> b.id - a.id); break;
    case "price-low": list.sort((a,b)=> a.price - b.price); break;
    case "price-high": list.sort((a,b)=> b.price - a.price); break;
    case "rating": list.sort((a,b)=> b.rating - a.rating); break;
    default: break; // featured = original order
  }
  return list;
}

/* ---------------------------------------------------------------------- *
 * 5. RENDERING
 * ---------------------------------------------------------------------- */
function productCardHTML(p){
  const inWishlist = state.wishlist.includes(p.id);
  const outOfStock = p.stock === 0;
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-img-wrap">
      ${p.badge ? `<span class="badge ${badgeClass(p.badge)} absolute top-3 left-3 z-10">${p.badge}</span>` : ""}
      <button class="wishlist-btn absolute top-3 right-3 z-10 ${inWishlist ? "active" : ""}" data-action="wishlist" data-id="${p.id}" aria-label="Toggle wishlist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
      </button>
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImgFor(p.sport)}'">
      <button class="quick-view-btn absolute w-full py-3" data-action="quickview" data-id="${p.id}">Quick View</button>
    </div>
    <div class="p-4 flex flex-col flex-1">
      <p class="text-[11px] uppercase tracking-wide text-khz-gray" style="color:var(--khz-gray)">${p.sport} · ${p.category}</p>
      <h3 class="font-bold text-sm mt-1 mb-1 leading-snug">${p.name}</h3>
      <p class="text-xs line-clamp-2 mb-2" style="color:var(--khz-gray)">${p.description}</p>
      <div class="flex items-center gap-1 mb-2">${starString(p.rating)} <span class="text-xs ml-1" style="color:var(--khz-gray)">(${p.reviews})</span></div>
      <div class="flex items-baseline gap-2 mb-1">
        <span class="price-current text-lg">${money(p.price)}</span>
        <span class="price-old text-xs">${money(p.oldPrice)}</span>
        <span class="text-xs font-bold" style="color:var(--khz-red)">-${p.discount}%</span>
      </div>
      <p class="text-xs mb-3 ${outOfStock ? "" : ""}" style="color:${outOfStock ? 'var(--khz-red)' : '#00C2A8'}">${outOfStock ? "Out of Stock" : `In Stock (${p.stock})`}</p>
      <button class="add-cart-btn mt-auto w-full py-2.5 rounded-lg text-xs" data-action="addcart" data-id="${p.id}" ${outOfStock ? "disabled" : ""}>
        ${outOfStock ? "Unavailable" : "Add to Cart"}
      </button>
    </div>
  </div>`;
}

function renderProducts(){
  const grid = $("#productGrid");
  const filtered = getFilteredProducts();
  const visible = filtered.slice(0, state.visibleCount);

  $("#toolbarCount").textContent = `Showing ${visible.length} of ${filtered.length} products`;

  if(state.view === "compact"){
    grid.className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";
  } else {
    grid.className = "grid grid-cols-2 lg:grid-cols-3 gap-5";
  }

  if(filtered.length === 0){
    grid.innerHTML = "";
    $("#emptyState").classList.remove("hidden");
  } else {
    $("#emptyState").classList.add("hidden");
    grid.innerHTML = visible.map(productCardHTML).join("");
  }

  $("#loadMoreWrap").classList.toggle("hidden", state.visibleCount >= filtered.length);
}

function renderTrending(){
  const wrap = $("#trendingGrid");
  const items = TRENDING_IDS.map(id => PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  wrap.innerHTML = items.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap" style="height:210px">
        ${p.badge ? `<span class="badge ${badgeClass(p.badge)} absolute top-3 left-3 z-10">${p.badge}</span>` : ""}
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImgFor(p.sport)}'">
        <button class="quick-view-btn absolute w-full py-3" data-action="quickview" data-id="${p.id}">Quick View</button>
      </div>
      <div class="p-4">
        <h3 class="font-bold text-sm mb-1">${p.name}</h3>
        <div class="flex items-baseline gap-2">
          <span class="price-current">${money(p.price)}</span>
          <span class="price-old text-xs">${money(p.oldPrice)}</span>
        </div>
        <button class="add-cart-btn mt-3 w-full py-2 rounded-lg text-xs" data-action="addcart" data-id="${p.id}">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

/* ---------------------------------------------------------------------- *
 * 6. CART
 * ---------------------------------------------------------------------- */
function addToCart(id, size, qty=1){
  const product = PRODUCTS.find(p=>p.id===id);
  if(!product || product.stock === 0) return;
  const chosenSize = size || product.sizes[0];
  const existing = state.cart.find(c => c.id===id && c.size===chosenSize);
  if(existing){ existing.qty += qty; }
  else { state.cart.push({ id, size:chosenSize, qty }); }
  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`, "cart");
}

function updateCartQty(id, size, delta){
  const item = state.cart.find(c=>c.id===id && c.size===size);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ state.cart = state.cart.filter(c => !(c.id===id && c.size===size)); }
  saveCart();
  renderCart();
}

function removeFromCart(id, size){
  state.cart = state.cart.filter(c => !(c.id===id && c.size===size));
  saveCart();
  renderCart();
  showToast("Item removed from cart", "cart");
}

function cartTotals(){
  let subtotal = 0;
  state.cart.forEach(c => {
    const p = PRODUCTS.find(pr=>pr.id===c.id);
    if(p) subtotal += p.price * c.qty;
  });
  const shipping = subtotal === 0 ? 0 : (subtotal >= 5000 ? 0 : 250);
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderCart(){
  const count = state.cart.reduce((s,c)=>s+c.qty,0);
  $("#cartCount").textContent = count;
  $("#cartCount").classList.toggle("hidden", count===0);

  const body = $("#cartItems");
  if(state.cart.length === 0){
    body.innerHTML = `<p class="text-sm text-center py-16" style="color:var(--khz-gray)">Your cart is empty.<br>Time to gear up!</p>`;
  } else {
    body.innerHTML = state.cart.map(c => {
      const p = PRODUCTS.find(pr=>pr.id===c.id);
      if(!p) return "";
      return `
      <div class="flex gap-3 py-4 border-b" style="border-color:var(--khz-line)">
        <img src="${p.image}" class="w-16 h-16 object-contain rounded-lg" style="background:#141414" onerror="this.onerror=null;this.src='${fallbackImgFor(p.sport)}'">
        <div class="flex-1">
          <p class="text-sm font-bold leading-snug">${p.name}</p>
          <p class="text-xs mb-1" style="color:var(--khz-gray)">Size: ${c.size}</p>
          <p class="price-current text-sm">${money(p.price)}</p>
          <div class="flex items-center gap-2 mt-2">
            <button class="w-6 h-6 rounded border text-xs" style="border-color:var(--khz-line)" data-action="qtyminus" data-id="${p.id}" data-size="${c.size}">−</button>
            <span class="text-sm w-5 text-center">${c.qty}</span>
            <button class="w-6 h-6 rounded border text-xs" style="border-color:var(--khz-line)" data-action="qtyplus" data-id="${p.id}" data-size="${c.size}">+</button>
            <button class="ml-auto text-xs underline" style="color:var(--khz-red)" data-action="removecart" data-id="${p.id}" data-size="${c.size}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  const { subtotal, shipping, total } = cartTotals();
  $("#cartSubtotal").textContent = money(subtotal);
  $("#cartShipping").textContent = shipping === 0 ? "FREE" : money(shipping);
  $("#cartTotal").textContent = money(total);
}

/* ---------------------------------------------------------------------- *
 * 7. WISHLIST
 * ---------------------------------------------------------------------- */
function toggleWishlist(id){
  const product = PRODUCTS.find(p=>p.id===id);
  if(state.wishlist.includes(id)){
    state.wishlist = state.wishlist.filter(w=>w!==id);
    showToast(`${product.name} removed from wishlist`, "wishlist");
  } else {
    state.wishlist.push(id);
    showToast(`${product.name} added to wishlist`, "wishlist");
  }
  saveWishlist();
  renderWishlistUI();
  renderProducts();
  renderTrending();
}

function renderWishlistUI(){
  const count = state.wishlist.length;
  $("#wishlistCount").textContent = count;
  $("#wishlistCount").classList.toggle("hidden", count===0);

  const body = $("#wishlistItems");
  if(count === 0){
    body.innerHTML = `<p class="text-sm text-center py-16" style="color:var(--khz-gray)">No saved items yet.<br>Tap the heart on any product.</p>`;
  } else {
    body.innerHTML = state.wishlist.map(id => {
      const p = PRODUCTS.find(pr=>pr.id===id);
      if(!p) return "";
      return `
      <div class="flex gap-3 py-4 border-b" style="border-color:var(--khz-line)">
        <img src="${p.image}" class="w-16 h-16 object-contain rounded-lg" style="background:#141414" onerror="this.onerror=null;this.src='${fallbackImgFor(p.sport)}'">
        <div class="flex-1">
          <p class="text-sm font-bold leading-snug">${p.name}</p>
          <p class="price-current text-sm">${money(p.price)}</p>
          <div class="flex items-center gap-3 mt-2">
            <button class="text-xs font-bold px-3 py-1.5 rounded add-cart-btn" data-action="addcart" data-id="${p.id}">Add to Cart</button>
            <button class="text-xs underline" style="color:var(--khz-red)" data-action="wishlist" data-id="${p.id}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }
}

/* ---------------------------------------------------------------------- *
 * 8. QUICK VIEW MODAL
 * ---------------------------------------------------------------------- */
let quickViewSize = null;

function openQuickView(id){
  const p = PRODUCTS.find(pr=>pr.id===id);
  if(!p) return;
  quickViewSize = p.sizes[0];
  $("#qvContent").innerHTML = `
    <div class="grid md:grid-cols-2 gap-0">
      <div class="p-6 flex items-center justify-center" style="background:#141414">
        <img src="${p.image}" class="max-h-80 object-contain" onerror="this.onerror=null;this.src='${fallbackImgFor(p.sport)}'">
      </div>
      <div class="p-6 md:p-8">
        <p class="text-xs uppercase tracking-wide mb-1" style="color:var(--khz-orange)">${p.sport} · ${p.category}</p>
        <h2 class="font-display text-2xl mb-2">${p.name}</h2>
        <div class="flex items-center gap-2 mb-3">${starString(p.rating)} <span class="text-xs" style="color:var(--khz-gray)">${p.rating} (${p.reviews} reviews)</span></div>
        <div class="flex items-baseline gap-3 mb-4">
          <span class="price-current text-2xl">${money(p.price)}</span>
          <span class="price-old">${money(p.oldPrice)}</span>
          <span class="badge badge-sale">-${p.discount}%</span>
        </div>
        <p class="text-sm mb-5" style="color:var(--khz-gray)">${p.description}</p>

        <p class="text-xs font-bold uppercase mb-2" style="color:var(--khz-gray)">Select Size</p>
        <div class="flex flex-wrap gap-2 mb-5" id="qvSizes">
          ${p.sizes.map(s => `<button class="size-pill px-4 py-2 rounded-lg text-xs ${s===quickViewSize?"selected":""}" data-size="${s}">${s}</button>`).join("")}
        </div>

        <p class="text-xs font-bold uppercase mb-2" style="color:var(--khz-gray)">Quantity</p>
        <div class="flex items-center gap-3 mb-6">
          <button id="qvQtyMinus" class="w-8 h-8 rounded border" style="border-color:var(--khz-line)">−</button>
          <span id="qvQty" class="w-6 text-center">1</span>
          <button id="qvQtyPlus" class="w-8 h-8 rounded border" style="border-color:var(--khz-line)">+</button>
          <span class="text-xs ml-auto" style="color:${p.stock ? '#00C2A8':'var(--khz-red)'}">${p.stock ? `In Stock (${p.stock})` : "Out of Stock"}</span>
        </div>

        <div class="flex gap-3">
          <button id="qvAddCart" class="add-cart-btn flex-1 py-3 rounded-lg text-sm" ${p.stock ? "" : "disabled"}>Add to Cart</button>
          <button id="qvWishlist" class="wishlist-btn ${state.wishlist.includes(p.id)?"active":""}" style="width:48px;height:48px;position:static">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  let qty = 1;
  $("#qvQtyPlus").onclick = () => { qty++; $("#qvQty").textContent = qty; };
  $("#qvQtyMinus").onclick = () => { if(qty>1){ qty--; $("#qvQty").textContent = qty; } };
  $$("#qvSizes .size-pill").forEach(btn => {
    btn.onclick = () => {
      quickViewSize = btn.dataset.size;
      $$("#qvSizes .size-pill").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
    };
  });
  $("#qvAddCart").onclick = () => { addToCart(p.id, quickViewSize, qty); };
  $("#qvWishlist").onclick = () => { toggleWishlist(p.id); $("#qvWishlist").classList.toggle("active"); };

  $("#quickViewModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeQuickView(){
  $("#quickViewModal").classList.add("hidden");
  document.body.style.overflow = "";
}

/* ---------------------------------------------------------------------- *
 * 9. TOASTS
 * ---------------------------------------------------------------------- */
function showToast(message, type="cart"){
  const container = $("#toastContainer");
  const icon = type === "wishlist"
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--khz-red)"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--khz-orange)" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
  const el = document.createElement("div");
  el.className = "toast flex items-center gap-3 px-4 py-3 rounded-xl mb-2";
  el.innerHTML = `${icon}<span class="text-sm font-medium">${message}</span>`;
  container.appendChild(el);
  setTimeout(()=>{
    el.classList.add("leaving");
    setTimeout(()=> el.remove(), 260);
  }, 2400);
}

/* ---------------------------------------------------------------------- *
 * 10. FILTER UI WIRING
 * ---------------------------------------------------------------------- */
function wireFilters(){
  $$('[data-filter="sport"]').forEach(cb => cb.addEventListener("change", () => {
    cb.checked ? state.sports.add(cb.value) : state.sports.delete(cb.value);
    state.visibleCount = 12;
    syncCategorySelection();
    renderProducts();
  }));
  $$('[data-filter="type"]').forEach(cb => cb.addEventListener("change", () => {
    cb.checked ? state.types.add(cb.value) : state.types.delete(cb.value);
    state.visibleCount = 12;
    renderProducts();
  }));
  $$('[data-filter="pricebucket"]').forEach(cb => cb.addEventListener("change", () => {
    cb.checked ? state.priceBuckets.add(cb.value) : state.priceBuckets.delete(cb.value);
    state.visibleCount = 12;
    renderProducts();
  }));
  $$('[data-filter="brand"]').forEach(cb => cb.addEventListener("change", () => {
    cb.checked ? state.brands.add(cb.value) : state.brands.delete(cb.value);
    state.visibleCount = 12;
    renderProducts();
  }));
  $$('[data-filter="size"]').forEach(cb => cb.addEventListener("change", () => {
    cb.checked ? state.sizes.add(cb.value) : state.sizes.delete(cb.value);
    state.visibleCount = 12;
    renderProducts();
  }));
  $$('[data-filter="rating"]').forEach(radio => radio.addEventListener("change", () => {
    state.minRating = parseFloat(radio.value);
    state.visibleCount = 12;
    renderProducts();
  }));

  const priceSlider = $("#priceRange");
  priceSlider.addEventListener("input", () => {
    state.priceMax = parseInt(priceSlider.value, 10);
    $("#priceRangeLabel").textContent = money(state.priceMax);
    state.visibleCount = 12;
    renderProducts();
  });

  $("#sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderProducts();
  });

  $("#viewGridBtn").addEventListener("click", () => setView("grid"));
  $("#viewCompactBtn").addEventListener("click", () => setView("compact"));

  $("#clearFiltersBtn").addEventListener("click", clearAllFilters);
  $("#clearFiltersBtn2")?.addEventListener("click", clearAllFilters);

  $("#loadMoreBtn").addEventListener("click", () => {
    state.visibleCount += 9;
    renderProducts();
  });
}

function setView(view){
  state.view = view;
  $("#viewGridBtn").classList.toggle("bg-white/10", view==="grid");
  $("#viewCompactBtn").classList.toggle("bg-white/10", view==="compact");
  renderProducts();
}

function clearAllFilters(){
  state.search = "";
  state.sports.clear();
  state.types.clear();
  state.brands.clear();
  state.sizes.clear();
  state.priceBuckets.clear();
  state.priceMax = 20000;
  state.minRating = 0;
  state.visibleCount = 12;
  $$('input[type="checkbox"]').forEach(cb => cb.checked = false);
  $$('input[type="radio"][data-filter="rating"]').forEach(r => r.checked = false);
  $("#priceRange").value = 20000;
  $("#priceRangeLabel").textContent = money(20000);
  $("#searchInput").value = "";
  $("#searchInputMobile") && ($("#searchInputMobile").value = "");
  syncCategorySelection();
  renderProducts();
}

function syncCategorySelection(){
  $$(".cat-card").forEach(card => {
    card.classList.toggle("selected", state.sports.has(card.dataset.sport));
  });
}

/* ---------------------------------------------------------------------- *
 * 11. SEARCH
 * ---------------------------------------------------------------------- */
function wireSearch(){
  const input = $("#searchInput");
  const clearBtn = $("#searchClearBtn");
  input.addEventListener("input", () => {
    state.search = input.value.trim();
    state.visibleCount = 12;
    clearBtn.classList.toggle("hidden", state.search === "");
    renderProducts();
    document.getElementById("shopGrid").scrollIntoView({ behavior:"smooth", block:"start" });
  });
  clearBtn.addEventListener("click", () => {
    input.value = "";
    state.search = "";
    clearBtn.classList.add("hidden");
    renderProducts();
  });
}

/* ---------------------------------------------------------------------- *
 * 12. CATEGORY CARDS
 * ---------------------------------------------------------------------- */
function wireCategoryCards(){
  $$(".cat-card").forEach(card => {
    card.addEventListener("click", () => {
      const sport = card.dataset.sport;
      if(state.sports.has(sport)){ state.sports.delete(sport); }
      else { state.sports.add(sport); }
      syncCategorySelection();
      $$(`[data-filter="sport"][value="${sport}"]`).forEach(cb => cb.checked = state.sports.has(sport));
      state.visibleCount = 12;
      renderProducts();
      $("#shopGrid").scrollIntoView({ behavior:"smooth", block:"start" });
    });
  });
}

/* ---------------------------------------------------------------------- *
 * 13. EVENT DELEGATION (product actions)
 * ---------------------------------------------------------------------- */
function wireDelegatedActions(){
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if(!btn) return;
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);

    if(action === "addcart"){ addToCart(id); }
    else if(action === "wishlist"){ toggleWishlist(id); }
    else if(action === "quickview"){ openQuickView(id); }
    else if(action === "qtyplus"){ updateCartQty(id, btn.dataset.size, 1); }
    else if(action === "qtyminus"){ updateCartQty(id, btn.dataset.size, -1); }
    else if(action === "removecart"){ removeFromCart(id, btn.dataset.size); }
  });
}

/* ---------------------------------------------------------------------- *
 * 14. DRAWERS / MODALS / MOBILE NAV
 * ---------------------------------------------------------------------- */
function wireDrawers(){
  const cartDrawer = $("#cartDrawer");
  const wishlistDrawer = $("#wishlistDrawer");
  const mobileFilter = $("#mobileFilterDrawer");
  const mobileNav = $("#mobileNav");

  const openDrawer = (el) => { el.classList.remove("closed"); $("#drawerBackdrop").classList.remove("hidden"); document.body.style.overflow="hidden"; };
  const closeAllDrawers = () => {
    [cartDrawer, wishlistDrawer, mobileFilter].forEach(d => d.classList.add("closed"));
    mobileNav.classList.add("hidden");
    $("#drawerBackdrop").classList.add("hidden");
    document.body.style.overflow = "";
  };

  $("#cartIconBtn").addEventListener("click", () => openDrawer(cartDrawer));
  $("#cartIconBtnMobile")?.addEventListener("click", () => openDrawer(cartDrawer));
  $("#closeCartBtn").addEventListener("click", closeAllDrawers);

  $("#wishlistIconBtn").addEventListener("click", () => openDrawer(wishlistDrawer));
  $("#closeWishlistBtn").addEventListener("click", closeAllDrawers);

  $("#mobileFilterBtn").addEventListener("click", () => openDrawer(mobileFilter));
  $("#closeMobileFilterBtn").addEventListener("click", closeAllDrawers);
  $("#applyMobileFilterBtn").addEventListener("click", closeAllDrawers);

  $("#mobileMenuBtn").addEventListener("click", () => { mobileNav.classList.remove("hidden"); $("#drawerBackdrop").classList.remove("hidden"); document.body.style.overflow="hidden"; });
  $("#closeMobileNavBtn").addEventListener("click", closeAllDrawers);

  $("#drawerBackdrop").addEventListener("click", closeAllDrawers);

  $("#viewCartBtn").addEventListener("click", () => { closeAllDrawers(); $("#shopGrid").scrollIntoView({behavior:"smooth"}); });
  $("#checkoutBtn").addEventListener("click", () => {
    if(state.cart.length === 0){ showToast("Your cart is empty", "cart"); return; }
    showToast("Checkout is a demo — order not placed", "cart");
  });

  $("#closeQuickViewBtn").addEventListener("click", closeQuickView);
  $("#quickViewModal").addEventListener("click", (e) => { if(e.target.id === "quickViewModal") closeQuickView(); });
  document.addEventListener("keydown", (e) => { if(e.key === "Escape"){ closeQuickView(); closeAllDrawers(); } });
}

/* ---------------------------------------------------------------------- *
 * 15. NEWSLETTER
 * ---------------------------------------------------------------------- */
function wireNewsletter(){
  const form = $("#newsletterForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#newsletterEmail").value.trim();
    if(!email) return;
    $("#newsletterForm").classList.add("hidden");
    $("#newsletterSuccess").classList.remove("hidden");
  });
}

/* ---------------------------------------------------------------------- *
 * 15b. URL-BASED SPORT FILTER (from homepage "Shop by Sport" cards)
 * ---------------------------------------------------------------------- */
function applyUrlSportFilter(){
  const params = new URLSearchParams(window.location.search);
  const sportParam = params.get("sport");
  if(!sportParam) return;

  const validSports = ["Football","Cricket","Tennis","Basketball","Volleyball","Badminton","Fitness","Running","Boxing","Hockey","Accessories"];
  const match = validSports.find(s => s.toLowerCase() === sportParam.toLowerCase());
  if(!match) return;

  state.sports.add(match);
  $$(`[data-filter="sport"][value="${match}"]`).forEach(cb => { cb.checked = true; });
  syncCategorySelection();
}

/* ---------------------------------------------------------------------- *
 * 16. INIT
 * ---------------------------------------------------------------------- */
function init(){
  wireFilters();
  wireSearch();
  wireCategoryCards();
  wireDelegatedActions();
  wireDrawers();
  wireNewsletter();
  applyUrlSportFilter();
  renderTrending();
  renderProducts();
  renderCart();
  renderWishlistUI();
  $("#priceRangeLabel").textContent = money(state.priceMax);
  $("#yearNow").textContent = new Date().getFullYear();
  if(new URLSearchParams(window.location.search).get("sport")){
    requestAnimationFrame(() => {
      $("#shopGrid").scrollIntoView({ behavior:"smooth", block:"start" });
    });
  }
}

document.addEventListener("DOMContentLoaded", init);