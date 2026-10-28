// Public review-approved article version 1; body wording retained from the source document.
export const cityMassArticle = {
  "intro": [
    "Cities with more people tend to contain more buildings and roads in total, but less of that material per resident. A new global study finds this pattern across cities and a more pronounced material economy in denser areas within them. The result gives researchers a reason to look beyond what things are made of and examine how buildings and infrastructure are arranged and shared.",
    "Published in Nature Cities on 26 October, “Nested economies of scale in global city mass” by Kangning Huang and Mingzhen Lu compares 3,588 cities and 17,497 analytical neighborhoods. It finds a stronger association between density and material efficiency within cities than the association between population size and material efficiency across whole cities. [1]"
  ],
  "sections": [
    {
      "id": "more-residents-do-not-mean-proportionally-more-mass",
      "heading": "More residents do not mean proportionally more mass",
      "paragraphs": [
        "The researchers estimated built mass by combining mapped building volumes and paved areas with estimates of mass per cubic meter of building or square meter of pavement. These conversion factors vary with construction type and region. The estimates cover buildings, roads and other pavement. They describe material already in place, rather than the amount a city builds or consumes in a year.",
        "Before combining cities, the researchers compared each relative to the typical population and built mass in its own country. This adjustment reduces the influence of national differences in typical material stock. The fitted scaling exponent is 0.90. An exponent of one would mean twice the population is associated with twice the mass. At 0.90, the fitted difference is about 87% more mass for twice the population. Larger cities still contain more material in total, but less per person on average.",
        "For neighborhoods, the researchers make the same adjustment within each city. The exponent is lower, at 0.75: the fitted comparison is about 68% more mass for twice the population, versus 87% across cities. Here the researchers use nearly equal-area hexagons, roughly 36 square kilometers each, so a cell with more people is also denser. These “neighborhoods” are analytical units much larger than a block and need not match the districts residents recognize.",
        "The numbers describe associations among existing places. They do not promise that doubling the population of a particular city, district or building will deliver the same material savings. Local conditions and the services people receive still have to be examined."
      ]
    },
    {
      "id": "what-people-can-share",
      "heading": "What people can share",
      "paragraphs": [
        "A building’s foundation and roof can serve several households rather than one. A road can connect more homes and workplaces along the same route. Public amenities can replace some facilities that would otherwise be duplicated in private spaces. The authors identify these as possible reasons denser places can support residents with less material each.",
        "The study does not measure the separate contribution of each mechanism or establish causation through a controlled intervention. Its theoretical framework instead explains how unequal population densities within cities can produce different patterns at the neighborhood and whole-city scales. A large city contains both dense and less dense areas; its aggregate result does not simply reproduce that of its densest parts.",
        "For Gaia Research, this invites an additional question before specifying a substitute for a conventional construction material: could a different arrangement provide the same service with fewer duplicated assets? That question belongs alongside work on lower-impact materials. The paper does not establish a numerical ranking between changing the layout and changing the material."
      ]
    },
    {
      "id": "a-question-for-shared-urban-corridors",
      "heading": "A question for shared urban corridors",
      "paragraphs": [
        "Eric Storm’s Vascular Los Angeles proposal explores shared corridors for utilities, transit and mixed uses. Its possible connection to this research is the opportunity to coordinate routes and supports, rather than designing each network in isolation. The published study did not evaluate that proposal, and its city-level relationships cannot be used to calculate the proposal’s savings.",
        "A shared corridor could also concentrate problems. It may need protective separation, additional structure and room for maintenance. A repair to one system should not routinely disrupt every other system using the route. The physical arrangement must allow inspection, emergency access and safe replacement, as well as everyday use.",
        "Branching structures inspired by trabecular bone, the porous network inside bones, are another proposal to investigate, not an outcome of this study. A form that distributes loads efficiently may still be difficult to fabricate, inspect or repair. It needs comparison with a simpler structure under the same loads and service requirements before any material advantage can be claimed.",
        "The test is therefore whether sharing can reduce total material demand while preserving the services people need. It is not whether a design looks dense, integrated or biological."
      ]
    },
    {
      "id": "the-missing-material-and-the-missing-outcomes",
      "heading": "The missing material and the missing outcomes",
      "paragraphs": [
        "The inventory has an important boundary. Subway mass is included in the study’s reported city totals, but the main statistical comparisons use the stock mapped above ground. Adding subway mass in a separate sensitivity test changes the reported exponents only slightly. Buried pipes, cables and other infrastructure that the mapping cannot capture are still missing, which limits how directly the results can inform a utility-corridor proposal.",
        "Material mass is also different from climate impact. Construction materials have different emissions profiles, and construction, operation and replacement add consequences that a stock inventory alone cannot resolve. The lightest option is not automatically the lowest-carbon or least expensive one. Nor does less material per resident demonstrate that residents have adequate homes, reliable services or equitable access.",
        "The study is not a case for crowding people together, building skyscrapers everywhere or demolishing usable neighborhoods. Existing buildings and infrastructure already contain invested material. For a practical proposal, keeping and renewing those assets belongs in the comparison with new construction."
      ]
    },
    {
      "id": "what-gaia-research-can-investigate-next",
      "heading": "What Gaia Research can investigate next",
      "paragraphs": [
        "A focused comparison could examine one service corridor in shared and separate configurations, including an option that retains and renews existing infrastructure. Each option would serve the same population with comparable capacity, reliability and accessibility. Researchers could then count the material in the whole system, including underground assets and access works, and assess carbon separately from the costs of construction, operation, maintenance and replacement.",
        "That would turn a broad observation about cities into a testable design question. Huang and Lu have found a recurring relationship between population and built mass. The next task is to establish when deliberate sharing can deliver a comparable service with less material, without creating maintenance burdens or risks that erase the gain."
      ]
    },
    {
      "id": "evidence-and-sources",
      "heading": "Evidence and sources",
      "paragraphs": [
        "The city exponent is 0.90, with a 95% confidence interval of 0.89–0.91; the neighborhood exponent is 0.75, with an interval of 0.747–0.754. Those respective comparisons account for differences in typical population and mass across countries or across cities, as described above. Neither estimate is a project-level savings forecast."
      ]
    }
  ],
  "sources": [
    {
      "id": "source-1",
      "href": "https://doi.org/10.1038/s44284-026-00532-x",
      "text": "Read the study in Nature Cities Kangning Huang and Mingzhen Lu, “Nested economies of scale in global city mass,” 26 October 2026. DOI 10.1038/s44284-026-00532-x."
    },
    {
      "id": "source-2",
      "href": "https://doi.org/10.6084/m9.figshare.29482190",
      "text": "Data and code repository cited in the paper Figshare DOI 10.6084/m9.figshare.29482190."
    }
  ]
} as const;
