"""Image jobs per group. Sizes follow each image's display box (see the CSS), at ~2x for retina.

Each job: name, out (path under public/, optional), size (w, h), aspect (generation ratio),
prompt, refs (names of earlier jobs in the same group used as style references).
"""

BIG = (2560, 1361)  # gallery 'big' tiles: object-fit fill at 190/101
MEDIUM = (2560, 1440)  # gallery 'medium' tiles: 16:9
SMALL = (972, 1964)  # gallery 'small' tiles: 243/491
COVER = (2560, 1200)  # project covers: thumbnail box 1920/900

UI_RULES = (
    'Flat, straight-on, full-bleed screen capture that fills the entire frame edge to edge: no device frame, '
    'no browser window, no desk, no perspective, no drop shadow around the screen. Premium, minimal Swiss design '
    'language with generous whitespace, crisp 1px hairline dividers, 8px corner radii and a refined neo-grotesk '
    'clean grotesk typeface similar to Inter Display with a clear typographic hierarchy. All text must be sharp, '
    'legible and correctly spelled English. Use realistic, plausible data and names (Indian context where natural). '
    'No lorem ipsum, no placeholder text, no watermarks, no real-world company or brand logos. '
    'Every organisation, hospital, bank, store or company name shown must be fictional; never use real institutions or brands. '
    'The colour hex codes and layout instructions in this prompt are styling guidance only: never print them as text in the image.'
)

# The generated frame is cropped to the display box afterwards, so reserve room for the crop.
DESKTOP_SAFE = 'Leave a clear margin of at least 5% of the frame height above the top bar and below the lowest element, because the image will be cropped slightly at the top and bottom.'
MOBILE_SAFE = (
    'This is NOT a phone mockup: the app screen itself fills the whole frame, with no phone body, bezel, rounded device outline, '
    'card or backdrop around it; the app\'s own background colour touches all four edges of the image. '
    'Use comfortable side margins of about 6% of the frame width.'
)

DESKTOP = 'a pixel-perfect, high-fidelity screenshot of a real, shipped desktop web application (1920px wide layout)'
MOBILE = (
    'a pixel-perfect, high-fidelity screenshot of a real, shipped native iPhone app screen in portrait, '
    'including the iOS status bar (9:41, signal, Wi-Fi, battery) at the top and the home indicator at the bottom'
)
CONSISTENT = (
    'The attached reference image(s) are other screens of this exact same product: match their design system '
    'precisely (colours, typography, spacing, icon style, component shapes, wordmark).'
)

COVER_RULES = (
    'Cinematic, editorial key visual, premium product photography quality, soft studio lighting, shallow depth of field, '
    'ultra detailed. Wide 2.13:1 frame. Keep the hero subject centred and fully inside the middle 40% of the frame width '
    'and vertically centred; leave calm, uncluttered negative space in the left third and right third. '
    'High contrast with luminous accents so it still reads when shown dimmed. No text, no letters, no numbers, no logos, no people.'
)


def ui(product, platform, palette, body, refs=False):
    safe = MOBILE_SAFE if platform == MOBILE else DESKTOP_SAFE
    parts = [f'Create {platform} for an AI product named "{product}".', body, f'Strict colour palette: {palette}.', UI_RULES, safe]
    if refs:
        parts.append(CONSISTENT)
    return ' '.join(parts)


# ---------------------------------------------------------------- project3: Pulse Scribe
P3 = 'Pulse Scribe'
P3_PALETTE = (
    'background warm off-white #F2EEE7, cards and panels #FCFBF7, primary text charcoal #2D2D2D, secondary text in a soft warm grey, '
    'a single accent electric blue #0028FF used sparingly for active states, highlights and key chart lines, '
    'and a muted green #1E9E6A only for small success status chips'
)

project3 = [
    {
        'name': '1',
        'out': 'project3/1.webp',
        'size': BIG,
        'aspect': '16:9',
        'prompt': ui(
            P3,
            DESKTOP,
            P3_PALETTE,
            'Screen: live consultation workspace. Top app bar with the "Pulse Scribe" wordmark next to a small electric-blue '
            'waveform glyph, breadcrumb "OPD / Cardiology / Room 4", and a round avatar with initials "AM". A patient header card: '
            '"Ritu Sharma · 42 F · MRN 20481-AH". Left column (40%): live transcript with timestamps and speaker labels '
            '"Dr. Ananya Mehta" and "Patient", topped by a slim audio waveform with a small red recording dot and the timer "12:48", '
            'a chip "Consent recorded" and language chips "English" and "Hindi". Right column (60%): an AI-drafted clinical note in '
            'SOAP format with section headers Subjective, Objective, Assessment, Plan and short bullet points (BP 138/88 mmHg, '
            'HR 82 bpm, ECG: normal sinus rhythm); a few phrases highlighted in pale blue with tiny citation markers that link to '
            'transcript timestamps; a small label "AI draft · 96% confidence"; buttons "Edit" and a primary electric-blue "Review & sign".',
        ),
    },
    {
        'name': '2',
        'out': 'project3/2.webp',
        'size': BIG,
        'aspect': '16:9',
        'refs': ['1'],
        'prompt': ui(
            P3,
            DESKTOP,
            P3_PALETTE,
            'Screen: clinical note review and sign-off. A clean document view of the structured note for "Ritu Sharma, 42 F": '
            'diagnosis with ICD-10 code "I10 Essential (primary) hypertension", a medication table (Telmisartan 40 mg, once daily, '
            '30 days; Atorvastatin 10 mg, at night, 30 days), follow-up "Review in 2 weeks", a few inline edits marked with a subtle '
            'blue underline. Right sidebar titled "Audit trail" with a vertical timeline: "Draft generated 10:42", '
            '"Edited by Dr. Mehta 10:44", "Signed 10:45". Primary electric-blue button "Sign & send to EHR".',
            refs=True,
        ),
    },
    {
        'name': '3',
        'out': 'project3/3.webp',
        'size': BIG,
        'aspect': '16:9',
        'refs': ['1'],
        'prompt': ui(
            P3,
            DESKTOP,
            P3_PALETTE,
            'Screen: hospital network analytics dashboard. Header row: page title "Network overview" and a date range pill '
            '"Last 12 weeks". Exactly four regions and nothing else: (1) a row of four KPI tiles with exactly these texts: '
            '"Documentation time saved" / "1,284 hrs" / "this month"; "Notes generated" / "48,210" / "this month"; '
            '"Clinician adoption" / "87%" / "across network"; "Avg. edits per note" / "1.6" / "down 40%". (2) A large line chart titled '
            '"Minutes per patient note" falling smoothly from 11.2 at "Week 1" to 4.3 at "Week 12", drawn in electric blue. '
            '(3) A horizontal bar chart titled "Adoption by department" with bars Cardiology 92%, Orthopaedics 85%, Paediatrics 78%, '
            'General Medicine 74%, Oncology 69%. (4) A table titled "Hospital network" with columns "Hospital" and "Adoption" and '
            'six rows: Aurelia Saket 94%, Aurelia Gurugram 89%, Aurelia Noida 86%, Aurelia Jaipur 81%, Aurelia Chandigarh 78%, '
            'Aurelia Lucknow 72%. No other panels, no notifications, no extra text.',
            refs=True,
        ),
    },
    {
        'name': '7',
        'out': 'project3/7.webp',
        'size': SMALL,
        'aspect': '9:16',
        'refs': ['1'],
        'prompt': ui(
            P3,
            MOBILE,
            P3_PALETTE,
            'Screen: recording a consultation. A large, calm electric-blue circular waveform visualiser in the centre, the timer '
            '"08:16", the caption "Listening · English + Hindi", a patient pill "Ritu Sharma · 42 F" near the top, a faded live '
            'transcript snippet near the bottom, and round pause and stop controls.',
            refs=True,
        ),
    },
    {
        'name': '6',
        'out': 'project3/6.webp',
        'size': SMALL,
        'aspect': '9:16',
        'refs': ['1', '7'],
        'prompt': ui(
            P3,
            MOBILE,
            P3_PALETTE,
            'Screen: AI note summary. Header "Draft note" with a small "AI draft" badge, then stacked cards Subjective, Objective, '
            'Assessment and Plan, each with two or three concise lines, and a sticky primary electric-blue button "Review & sign" at the bottom.',
            refs=True,
        ),
    },
    {
        'name': '5',
        'out': 'project3/5.webp',
        'size': SMALL,
        'aspect': '9:16',
        'refs': ['1', '7'],
        'prompt': ui(
            P3,
            MOBILE,
            P3_PALETTE,
            'Screen: prescription draft. Title "Prescription", three medication cards (Telmisartan 40 mg · 1-0-0 · 30 days; '
            'Atorvastatin 10 mg · 0-0-1 · 30 days; Aspirin 75 mg · 0-1-0 · 30 days), a chip "No known allergies", and a primary '
            'electric-blue button "Sign prescription".',
            refs=True,
        ),
    },
    {
        'name': '8',
        'out': 'project3/8.webp',
        'size': SMALL,
        'aspect': '9:16',
        'refs': ['1', '7'],
        'prompt': ui(
            P3,
            MOBILE,
            P3_PALETTE,
            'Screen: today\'s schedule. Greeting "Good morning, Dr. Mehta", date "Thu, 14 May", a small stats strip "4.1 min avg. '
            'note time", and a list of six appointments with times, patient names and status chips ("Note signed" green, '
            '"Draft ready" blue, "Upcoming" grey).',
            refs=True,
        ),
    },
    {
        'name': 'cover',
        'out': 'project3/project3.webp',
        'size': COVER,
        'aspect': '21:9',
        'prompt': (
            'Key visual for "Pulse Scribe", an AI clinical documentation copilot. A sculptural, translucent glass ribbon shaped '
            'like a human voice waveform that flows from left to right and gradually resolves into neat, glowing horizontal lines '
            'like the rows of a typeset medical note (abstract light lines, nothing readable). It floats above a warm off-white '
            'stone plinth (#F2EEE7) against a deep charcoal (#2D2D2D) backdrop, with electric blue (#0028FF) light refracting '
            'inside the glass and a soft blue glow on the plinth. ' + COVER_RULES
        ),
    },
]

# ---------------------------------------------------------------- project4: Freightmind (Corvex Logistics)
P4 = 'Freightmind'
P4_PALETTE = (
    'background cool light grey #F3F5F7, cards white, primary text deep slate #263745, secondary text in a muted blue-grey, '
    'primary accent indigo #5C58EB for actions, selected states and main chart lines, soft lavender #E0DFFC for subtle fills, '
    'and olive #A3A714 used sparingly for forecast highlights and warnings'
)


def p4(name, size, body, refs=('1',)):
    job = {'name': name, 'out': f'project4/{name}.webp', 'size': size, 'aspect': '16:9', 'prompt': ui(P4, DESKTOP, P4_PALETTE, body, refs=bool(refs))}
    if refs:
        job['refs'] = list(refs)
    return job


project4 = [
    p4('1', BIG, 'Screen: "Command center". Left: a stylised, minimal map of India (no real map tiles) with glowing indigo route lines between hub dots labelled New Delhi, Jaipur, Ahmedabad, Mumbai, Pune, Bengaluru, Hyderabad, Kolkata. Top KPI strip with exactly: "Shipments today 41,208", "On-time 96.4%", "At risk 312", "Empty miles -18%". Right panel titled "AI recommendations" with three cards, each with a one-line reason and buttons "Accept", "Edit", "Reject": "Reroute 14 trucks via NH48 to avoid Vapi congestion · saves 3.2 h", "Consolidate 6 part-loads Pune → Bengaluru · saves Rs 41,000", "Add 2 vehicles at Bhiwandi hub for 6 pm peak".', refs=()),
    p4('2', MEDIUM, 'Screen: "Demand forecast · next 14 days". A large line chart with "Actual" (slate) and "Forecast" (indigo) lines and a soft lavender confidence band, region tabs "North", "West", "South", "East", and a badge "Forecast accuracy 94.1%". Below, a small table of top lanes with forecast volumes.'),
    p4('3', MEDIUM, 'Screen: "Dispatch planner". A table of today\'s loads (load ID, origin, destination, weight, pickup window) on the left and a list of trucks with horizontal capacity bars on the right; two loads highlighted with an indigo "Auto-assigned" tag.'),
    p4('4', BIG, 'Screen: "Route detail · Mumbai → Bengaluru". A clean, abstract route map with one indigo route and stop markers, a vertical stop timeline with ETAs, and a summary card "Distance 984 km · ETA 18 h 40 m · Fuel saved 7.8%".'),
    p4('5', MEDIUM, 'Screen: "Delay risk". A list of at-risk shipments with a risk score bar (0 to 100), lane, ETA and a short reason such as "Heavy rain forecast, Mumbai", "Hub congestion, Bhiwandi", "Driver hours limit". A filter bar on top.'),
    p4('6', MEDIUM, 'Screen: an AI assistant panel inside the app. The planner asks "Why is the Pune to Bengaluru lane at risk tomorrow?" and the assistant answers in three short bullet points with a small inline bar chart of hourly hub load and a button "Apply suggested plan".'),
    p4('7', BIG, 'Screen: "Fleet utilisation". A heatmap of hubs (rows: New Delhi, Mumbai, Pune, Bengaluru, Hyderabad, Kolkata) by hour of day (columns) in shades of indigo, plus three KPI tiles: "Average utilisation 87%", "Idle hours -22%", "Active vehicles 1,846".'),
    p4('8', BIG, 'Screen: "Hub forecast · Bhiwandi". Inbound and outbound volume forecast bars by hour for the next 48 hours, a staffing recommendation card "Add 12 loaders for 18:00 to 22:00", and a dock schedule table whose Carrier column only uses the client\'s own fictional fleets "Corvex Linehaul", "Corvex Express" and "Corvex Regional" (no other carrier names).'),
    p4('9', MEDIUM, 'Screen: "Scenario simulator". Title "What if festive demand rises 35%?" with three sliders (Demand +35%, Fleet size, Hub capacity) on the left and an impact summary on the right: projected on-time rate, extra vehicles needed, cost per shipment, with a small comparison chart.'),
    p4('10', MEDIUM, 'Screen: "Exceptions inbox". A clean list of exceptions grouped by priority with status pills ("New", "Assigned", "Resolved"), each with a suggested action written by the AI and an owner avatar.'),
    p4('11', BIG, 'Screen: "Weekly performance". A report page comparing "Before Freightmind" and "With Freightmind": forecast accuracy 78% vs 94%, empty miles 24% vs 6%, planner hours per day 6.5 vs 2.1, shown as paired bars and three large stat tiles.'),
    {
        'name': 'cover', 'out': 'project4/project4.webp', 'size': COVER, 'aspect': '21:9',
        'prompt': 'Key visual for "Freightmind", AI forecasting and dispatch for a freight network. A dark slate (#263745) scene seen from a low aerial angle: a minimal sculptural relief map rendered in matte slate, with luminous indigo (#5C58EB) light trails flowing along routes between glowing hub nodes, a few soft olive (#A3A714) highlights where routes converge, like long-exposure traffic photography. ' + COVER_RULES,
    },
]

# ---------------------------------------------------------------- project5: Vault Search (Solenne Capital)
P5 = 'Vault Search'
P5_PALETTE = (
    'background near-white #FAFAFA, cards white, primary text black #000000, secondary text in a medium grey, '
    'accent deep blue #002AB0 for actions, links and selected states, and warm amber #FFD54F used only to highlight cited passages'
)


def p5(name, size, body, refs=('1',)):
    job = {'name': name, 'out': f'project5/{name}.webp', 'size': size, 'aspect': '16:9', 'prompt': ui(P5, DESKTOP, P5_PALETTE, body, refs=bool(refs))}
    if refs:
        job['refs'] = list(refs)
    return job


project5 = [
    p5('1', BIG, 'Screen: answer view of a private enterprise knowledge assistant for "Solenne Capital" (fictional investment firm). A search bar containing the question "Which portfolio companies have change-of-control clauses in their shareholder agreements?". Below, a concise AI answer in short paragraphs with small numbered citation markers [1] [2] [3], and a "Confidence: High" pill. Right column: three source cards with document titles (fictional, e.g. "Halcyon Foods · Shareholders Agreement · 2021", "Kestrel Mobility · SHA Amendment · 2022", "Brightwave Energy · Term Sheet · 2020") and short excerpts with key phrases highlighted in amber.', refs=()),
    p5('2', BIG, 'Screen: document viewer. A PDF-like contract page (fictional "Halcyon Foods · Shareholders Agreement") with clause 14.2 "Change of Control" highlighted in amber and a small citation tag "Cited in answer". Right sidebar with document metadata: "Deal: Project Halcyon", "Uploaded: 12 Mar 2021", "Access: Investment Committee", page thumbnails below.'),
    p5('3', MEDIUM, 'Screen: workspace home "Good afternoon, Kavya". Recent questions list, pinned collections ("Fund III LPAs", "Portfolio board decks", "IC memos 2018-2024"), and a small usage card "1,284 questions this week".'),
    p5('4', MEDIUM, 'Screen: "Access & permissions". A table of collections with access groups ("Investment Committee", "Deal team", "Partners", "Analysts") and lock icons, plus a note banner "Answers only use documents you are allowed to open".'),
    p5('5', BIG, 'Screen: an AI-generated comparison table titled "Liquidation preferences across portfolio companies" with 8 rows of fictional companies and columns "Instrument", "Preference", "Participation", "Source", each source cell showing a small citation link.'),
    p5('6', BIG, 'Screen: "Evaluation suite · 2,000 questions". Line chart of accuracy across releases v1.0 to v2.4 rising from 81% to 95.8%, three KPI tiles "Accuracy 95.8%", "Citation precision 98.2%", "Hallucination rate 0.4%", and a table of the latest test runs.'),
    p5('7', BIG, 'Screen: a multi-turn analyst conversation. Three question and answer pairs about a fictional company "Kestrel Mobility" (revenue growth, board composition, key risks), each answer with citation markers, and a row of suggested follow-up questions at the bottom.'),
    p5('8', BIG, 'Screen: "Sources & indexing". Connected sources listed as cards (generic icons, labelled "Document drive", "Deal data room", "Email archive", "Board portal") with document counts and sync status, and a large stat "1.2M documents indexed" with a small ingestion chart.'),
    p5('9', MEDIUM, 'Screen: "Draft IC memo". A two-column editor: left, an AI-drafted investment committee memo with headings (Summary, Thesis, Risks, Terms) and citation markers; right, the source excerpts used.'),
    p5('10', MEDIUM, 'Screen: "Audit log". A clean table with columns Time, User, Question, Sources opened, and a filter bar; one row expanded showing the cited documents.'),
    {
        'name': 'cover', 'out': 'project5/project5.webp', 'size': COVER, 'aspect': '21:9',
        'prompt': 'Key visual for "Vault Search", a private AI knowledge assistant for an investment firm. A monolithic matte black stone vault door, slightly open, with deep blue (#002AB0) light spilling out and a few translucent, glowing document pages floating out of the opening in a gentle arc; one page edge catches a warm amber (#FFD54F) glint. Polished black floor with soft reflections. ' + COVER_RULES,
    },
]

# ---------------------------------------------------------------- project1: Muse (Brightlane Retail)
P1 = 'Muse'
P1_PALETTE = (
    'background off-white #F9F9F9, cards white, primary text black #000000, secondary text in a medium grey, '
    'primary accent coral #FF573E for call-to-action buttons and the Muse assistant, secondary accent teal #00A8C1 for tags and links, '
    'and pale mint #EBFAF8 for assistant message bubbles'
)
P1_SHOP = (
    'The store is the fictional fashion retailer "Brightlane"; product photos are realistic studio photos of clothing and accessories '
    'on plain backgrounds; prices in Indian rupees (Rs). Product names are descriptive or use Brightlane\'s fictional house labels '
    '"Noor", "Ira" and "Mehr" only; never use real fashion brand names (no Zara, H&M, Mango, Fabindia or similar).'
)


def p1(name, size, body, refs=('1',), mobile=False):
    job = {'name': name, 'out': f'project1/{name}.webp', 'size': size, 'aspect': '9:16' if mobile else '16:9', 'prompt': ui(P1, MOBILE if mobile else DESKTOP, P1_PALETTE, body + ' ' + P1_SHOP, refs=bool(refs))}
    if refs:
        job['refs'] = list(refs)
    return job


project1 = [
    p1('1', BIG, 'Screen: the Brightlane web store with the Muse shopping assistant open as a right-side chat drawer. The shopper wrote "I need an outfit for a friend\'s sangeet in December, budget Rs 8,000". Muse replies with a short friendly message and three curated look cards (product photo, name, price), a "Complete the look" button, and quick-reply chips "More colourful", "Under Rs 5,000", "Show men\'s". Behind the drawer, the store homepage with a festive collection banner.', refs=()),
    p1('5', BIG, 'Screen: a product listing page curated by Muse, titled "Festive looks for you". Filter chips derived from the conversation ("Festive", "Under Rs 8,000", "Size M", "Jewel tones") and a grid of 8 product cards with photos, names and prices; a small coral "Picked by Muse" tag on some cards.'),
    p1('6', BIG, 'Screen: Brightlane\'s internal analytics dashboard for Muse: KPI tiles "Conversations 412K this month", "Conversion 3.4x vs search", "Average order value +22%", "Returns -27%"; a line chart of daily conversations; a bar chart "Top shopper intents" (Festive wear, Office wear, Gifting, Footwear, Accessories).'),
    p1('8', BIG, 'Screen: "Muse studio", the merchandising console. Left: brand voice settings with example replies; centre: rules like "Prefer in-stock sizes" and "Promote new arrivals" as toggles; right: a live preview of a Muse reply with product cards.'),
    p1('2', SMALL, 'Screen: the Brightlane app chat with Muse. A short conversation about a sangeet outfit, then a horizontal carousel of three product cards with photos and prices, and a message input at the bottom with a coral send button.', mobile=True),
    p1('7', SMALL, 'Screen: "Your looks", a single-column list of exactly three different saved outfits, titled "Sangeet night", "Office Monday" and "Weekend brunch" (each title appears once), each shown as a neat row of product photos with its total price.', refs=('1', '2'), mobile=True),
    p1('3', SMALL, 'Screen: a product detail page for a jewel-toned silk kurta set with a large photo, price, size selector, and a mint "Ask Muse" card saying "Based on your past orders, size M fits you best".', refs=('1', '2'), mobile=True),
    p1('4', SMALL, 'Screen: the cart with two items, a "Pairs well with" row suggested by Muse (earrings, juttis), the order total and a coral "Checkout" button.', refs=('1', '2'), mobile=True),
    {
        'name': 'cover', 'out': 'project1/project1.webp', 'size': COVER, 'aspect': '21:9',
        'prompt': 'Key visual for "Muse", an AI shopping assistant for a fashion retailer. Editorial still life on a seamless off-white backdrop: a large translucent frosted-glass speech bubble floating in the centre, with an elegant arrangement of fashion objects partly visible through and around it (a folded silk scarf, a sculptural sneaker, a small structured handbag), lit with a warm coral (#FF573E) glow from inside the bubble and a subtle teal (#00A8C1) rim light. ' + COVER_RULES,
    },
]

# ---------------------------------------------------------------- project2: Lumora Credit (Lumora)
P2 = 'Lumora Credit'
P2_PALETTE = (
    'background near-white #FBFBFC, cards white, brand and primary text deep indigo #0E0063, secondary text in a muted grey-violet, '
    'soft lavender #E1E1F9 for panels and chart fills, and pale lime #E8FFC8 with a darker green label only for approvals and positive signals'
)


def p2(name, body, refs=('1',)):
    job = {'name': name, 'out': f'project2/{name}.webp', 'size': BIG, 'aspect': '16:9', 'prompt': ui(P2, DESKTOP, P2_PALETTE, body, refs=bool(refs))}
    if refs:
        job['refs'] = list(refs)
    return job


project2 = [
    p2('1', 'Screen: an AI underwriting copilot reviewing a business loan application for the fictional company "Riya Textiles Pvt Ltd". Left: applicant summary (loan requested Rs 25,00,000, tenure 36 months, vintage 7 years). Centre: a large risk score gauge "742 / 900 · Low risk" and an explanation list of decision factors with up or down arrows ("Stable monthly cash flow", "GST filings on time 24/24 months", "No bounced cheques in 12 months", "High customer concentration"). Right: recommendation card "Approve Rs 25,00,000 at 14.5%" with buttons "Approve", "Request documents", "Decline".', refs=()),
    p2('2', 'Screen: "Bank statement analysis". A monthly inflow and outflow bar chart for 12 months, a parsed transactions table (date, description, category, amount), detected recurring EMIs listed as chips, and two flagged anomalies with short explanations.'),
    p2('3', 'Screen: "Portfolio overview". KPI tiles "Applications today 186", "Approval rate 61%", "Median decision time 8 min", "Default rate 1.2%"; a risk distribution histogram; and a table of partner banks (fictional names) with volumes.'),
    {
        'name': 'cover', 'out': 'project2/project2.webp', 'size': COVER, 'aspect': '21:9',
        'prompt': 'Key visual for "Lumora Credit", an AI underwriting copilot. A deep indigo (#0E0063) glass prism floating in darkness; a pale lime (#E8FFC8) beam of light enters it and exits as a clean, rising staircase of light bars like an ascending chart, with soft lavender (#E1E1F9) caustics on the surface below. ' + COVER_RULES,
    },
]

# ---------------------------------------------------------------- brand / team images
BRAND_RULES = 'Premium editorial photography, soft natural studio light, shallow depth of field, ultra detailed, calm and sophisticated. Neutral palette of off-white (#F0F4F1), warm greys and charcoal (#28282B) with one subtle electric-blue glow. No people, no faces, no text, no logos.'
brand = [
    {
        'name': 'team', 'out': 'brand/team.webp', 'size': (1800, 2080), 'aspect': '3:4',
        'prompt': 'Portrait-format image representing a small senior team that builds intelligent products: on a pale stone plinth, a balanced sculptural composition of three distinct objects working together (a matte off-white geometric block, a brushed aluminium arc, and a softly glowing translucent glass sphere at the centre of the arrangement, with a faint electric-blue light inside). Subject centred. ' + BRAND_RULES,
    },
    {
        'name': 'studio', 'size': (3200, 1800), 'aspect': '16:9',
        'prompt': 'Wide cinematic interior of a minimalist, modern AI studio in New Delhi at golden hour, empty of people: tall windows with warm light, a long pale oak table with two closed laptops, and on the far wall in the centre of the frame a large screen showing an abstract glowing neural-network visualisation in soft electric blue. The key subject (the glowing screen and table) sits in the central third of the frame, lower-middle. ' + BRAND_RULES,
    },
]

# ---------------------------------------------------------------- client emblems (badges)
EMBLEM_RULES = (
    'Flat vector logomark, pure white shape on a solid pure black background, perfectly centred, occupying about 60% of the '
    'frame, crisp geometric edges, no gradients, no shadows, no text, no letters unless stated, premium and minimal like a '
    'top-tier design agency identity.'
)
emblems = [
    {'name': 'aurelia', 'aspect': '1:1', 'imageSize': '1K', 'prompt': 'Logomark for "Aurelia Health", a hospital network: an open arch shaped like an elegant upside-down U (a doorway with two legs and NO bottom bar, open at the bottom), with a small solid medical plus sign floating centred inside the arch. Not a padlock, no halo, no ring, no letters. ' + EMBLEM_RULES},
    {'name': 'corvex', 'aspect': '1:1', 'imageSize': '1K', 'prompt': 'Logomark for "Corvex Logistics", a freight company: an abstract, dynamic symbol of two interlocking chevrons forming forward motion, suggesting routes and speed. ' + EMBLEM_RULES},
    {'name': 'lumora', 'aspect': '1:1', 'imageSize': '1K', 'prompt': 'Logomark for "Lumora", a fintech startup: an abstract, luminous symbol of a crescent of light rising over a horizon line, suggesting trust and clarity. ' + EMBLEM_RULES},
]

# ---------------------------------------------------------------- case-study cover backgrounds
# Text-free art backgrounds; render_covers.mjs places the real product screens on top.
BG_RULES = (
    'Premium abstract background for a product case-study hero image, in the style of top Behance and Dribbble shots. '
    'A smooth, rich gradient mesh with soft, out-of-focus light shapes, gentle glass-like ribbons of light and a subtle film grain; '
    'a soft diagonal light sweep from the top left. Luxurious, calm and high-end, with depth. Wide 21:9 frame. '
    'No objects, no devices, no screens, no UI, no text, no letters, no logos, no people.'
)
coverbg = [
    {'name': 'p3', 'aspect': '21:9', 'prompt': 'Colours: saturated electric blue (#0028FF) flowing into deep navy, with a warm off-white (#F2EEE7) glow in the upper right. ' + BG_RULES},
    {'name': 'p4', 'aspect': '21:9', 'prompt': 'Colours: vivid indigo violet (#5C58EB) flowing into deep slate blue (#263745), with a soft lavender (#E0DFFC) haze and a small olive-gold (#A3A714) light accent. ' + BG_RULES},
    {'name': 'p5', 'aspect': '21:9', 'prompt': 'Colours: deep royal blue (#002AB0) flowing into near-black, with a warm amber (#FFD54F) light glow low on the right. ' + BG_RULES},
    {'name': 'p1', 'aspect': '21:9', 'prompt': 'Colours: warm coral (#FF573E) and peach flowing into bright teal (#00A8C1), with a pale mint (#EBFAF8) highlight. Fresh, fashionable and joyful. ' + BG_RULES},
    {'name': 'p2', 'aspect': '21:9', 'prompt': 'Colours: deep indigo (#0E0063) flowing into soft lavender (#E1E1F9), with a luminous pale lime (#E8FFC8) light accent. ' + BG_RULES},
]

# ---------------------------------------------------------------- client ID card photos (fictional people)
ID_PHOTO = (
    'Realistic corporate ID card photograph of a fictional person (not a real or famous individual): front-facing, head and '
    'shoulders, centred, looking at the camera with a calm, friendly expression, plain soft light-grey studio background, '
    'soft even lighting, sharp focus, natural skin texture, high-end passport-photo framing. No text, no logos, no watermark.'
)
idphotos = [
    {'name': 'aurelia', 'aspect': '3:4', 'imageSize': '1K', 'prompt': 'An Indian woman doctor in her early forties, hair neatly tied back, wearing a white doctor\'s coat over a navy blouse with a stethoscope around her neck. ' + ID_PHOTO},
    {'name': 'corvex', 'aspect': '3:4', 'imageSize': '1K', 'prompt': 'An Indian man in his late thirties with short hair and a neatly trimmed beard, wearing a light blue formal shirt under a dark navy blazer. ' + ID_PHOTO},
    {'name': 'lumora', 'aspect': '3:4', 'imageSize': '1K', 'prompt': 'An Indian woman in her early thirties, a startup co-founder, shoulder-length hair, wearing a smart charcoal blazer over a simple white top. ' + ID_PHOTO},
]

GROUPS = {
    'idphotos': idphotos,
    'coverbg': coverbg,
    'project3': project3,
    'project4': project4,
    'project5': project5,
    'project1': project1,
    'project2': project2,
    'brand': brand,
    'emblems': emblems,
}
