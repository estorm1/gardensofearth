export const profiles = [
  {
    title: "Los Angeles", subtitle: "An Aspiring Biourban River City",
    image: "/images/LAriverMidTermPlan.jpg", alt: "Concept for a greener Los Angeles River corridor",
    mechanism: "Gardens of Earth proposes LA River greening to reconnect habitat, water, shade, and public life, learning from the cities on this journey.",
    evidence: "An ambition, not an achieved status. LA is presented here as an aspiring peer, not yet an established biourban leader.",
    label: "Our aspiration", sources: [] as {label:string;url:string}[],
  },
  {
    title: "Singapore", subtitle: "Biophilic High-Density Integration",
    image: "/images/network-singapore.webp", alt: "Illustrated tropical towers, hanging gardens, sky bridges, and a naturalized river",
    mechanism: "LUSH landscape replacement and ABC Waters integrate greenery with development and waterways. Replacement requirements vary by location and development type.",
    evidence: "At Bishan-Ang Mo Kio Park, a concrete canal became a naturalized river within a public park: a built example of water and landscape working together.",
    label: "Built example", sources: [
      {label:"URA / LUSH",url:"https://www.ura.gov.sg/guidelines/development-control/development-control-handbooks/residential/flats-condominiums/greenery/"},
      {label:"PUB / ABC Waters",url:"https://www.pub.gov.sg/Public/Places-of-Interest/Our-Reservoirs-and-Waterways/Bishan-Ang-Mo-Kio-Park"},
    ],
  },
  {
    title: "Medellín, Colombia", subtitle: "Targeted Microclimate Corridors",
    image: "/images/network-medellin.webp", alt: "Illustrated hillside city with planted transit corridors and overhead cable cars",
    mechanism: "Corredores Verdes: the 30-corridor programme connected planting along 18 roads and 12 waterways, bringing shade into everyday urban routes.",
    evidence: "More than 2°C of cooling was reported for the green-corridor intervention by UNEP in 2019. This is a local reported result, not a citywide guarantee.",
    label: "Reported impact", sources: [{label:"UNEP / 2019",url:"https://www.unep.org/es/noticias-y-reportajes/reportajes/medellin-se-refresca-con-intervenciones-urbanas-basadas-en-la"}],
  },
  {
    title: "Copenhagen, Denmark", subtitle: "Hydrological Climate Adaptation",
    image: "/images/network-copenhagen.webp", alt: "Illustrated rainwater plaza, brick buildings, bike lanes, and vegetated swales",
    mechanism: "The Cloudburst Management Plan combines parks, sunken streets, and temporary surface storage with underground drainage to manage extreme rainfall.",
    evidence: "A 100-year rainfall event is the planning standard, not a claim of immunity to flooding. Surface landscapes complement, rather than replace, pipes.",
    label: "Design standard", sources: [{label:"EEA / Copenhagen plan",url:"https://climate-adapt.eea.europa.eu/en/metadata/case-studies/the-economics-of-managing-heavy-rains-and-stormwater-in-copenhagen-2013-the-cloudburst-management-plan"}],
  },
  {
    title: "Wuhan & Shenzhen, China", subtitle: "Regional Sponge City Engineering",
    image: "/images/network-shenzhen.webp", alt: "Illustrated urban wetlands, retention lakes, permeable paths, and bioswales",
    mechanism: "Sponge-city approaches combine bioswales, permeable paving, constructed wetlands, and lake restoration. This paired case is shown geographically at Shenzhen.",
    evidence: "70% of rainfall absorbed and used locally is the national programme target. It is not a uniform measured retention rate across either city.",
    label: "Programme target", sources: [{label:"State Council / 2015 guidance",url:"https://www.mof.gov.cn/zhengwuxinxi/zhengcefabu/201510/t20151016_1507043.htm"}],
  },
  {
    title: "Basel, Switzerland", subtitle: "Structural Biodiversity Mandates",
    image: "/images/network-basel.webp", alt: "Illustrated Basel rooftops with native meadow planting and gravel habitats",
    mechanism: "Green-roof requirements for new and renovated flat roofs pair locally appropriate substrate with native planting and habitat features for biodiversity.",
    evidence: "5.71 m² of green roof per resident was reported for 2019 by Climate-ADAPT. Roof area is an adoption measure, not proof that every roof is a nature reserve.",
    label: "Reported adoption", sources: [{label:"EEA / Climate-ADAPT",url:"https://climate-adapt.eea.europa.eu/en/metadata/case-studies/green-roofs-in-basel-switzerland-combining-mitigation-and-adaptation-measures-1"}],
  },
];
