/**
 * Metadata, categories, FAQs, and SEO details for all DexaCV tools.
 */

export const TOOL_CATEGORIES = [
  {
    id: "cv-tools",
    name: "CV Tools",
    description: "Inspect, improve, and format your curriculum vitae for ATS systems.",
    badge: "Essential"
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    description: "Fast, secure in-browser PDF utilities for document preparation.",
    badge: "Client-Side"
  },
  {
    id: "image-tools",
    name: "Image Tools",
    description: "Resize, compress, convert, and polish photos and signatures.",
    badge: "Instant"
  },
  {
    id: "application-tools",
    name: "Application Tools",
    description: "Craft cover letters, analyze job descriptions, and prepare packages.",
    badge: "Career Ready"
  }
];

export const ALL_TOOLS = [
  // --- CV Tools ---
  {
    id: "cv-checker",
    path: "/tools/cv-checker",
    category: "cv-tools",
    name: "CV Checker",
    shortDesc: "Audit your CV against ATS standards, missing sections, and formatting errors.",
    h1: "Free ATS CV Checker & Resume Audit",
    metaTitle: "Free ATS CV Checker | DexaCV",
    metaDesc: "Test your CV for ATS compatibility, keyword density, section headers, and formatting issues. Get instant recommendations without an account.",
    icon: "FileCheck",
    badge: "Most Popular",
    howItWorks: [
      { step: 1, title: "Upload or Select CV", text: "Upload your PDF or select a CV created in DexaCV." },
      { step: 2, title: "Automated ATS Scan", text: "Our parser checks section headers, contact information, metrics, and text extractability." },
      { step: 3, title: "Actionable Report", text: "Receive a prioritized checklist of fixes to boost your recruiter callback rate." }
    ],
    faq: [
      { q: "What does this CV checker look for?", a: "It evaluates ATS parsability (whether automated scanners can read your text), contact info completeness, standard headings, quantified impact bullets, and optimal document size." },
      { q: "Is my CV uploaded to external servers?", a: "No. Analysis is performed directly in your browser or through encrypted local sessions. Your document is never sold or used for model training." },
      { q: "What file formats are supported?", a: "PDF files and existing CVs saved in DexaCV." }
    ],
    privacyNote: "Your CV is analyzed securely in your browser session. We never store or share your personal details.",
    relatedToolIds: ["cv-text-extractor", "job-description-analyzer", "compress-pdf", "cover-letter-generator"]
  },
  {
    id: "cv-text-extractor",
    path: "/tools/cv-text-extractor",
    category: "cv-tools",
    name: "CV Text Extractor",
    shortDesc: "Extract clean, editable text from your PDF CV to paste into job application portals.",
    h1: "CV Text Extractor for Application Forms",
    metaTitle: "CV Text Extractor | DexaCV",
    metaDesc: "Quickly extract pure, formatted text from any PDF CV or resume to paste into Workday, Taleo, Greenhouse, and job portals.",
    icon: "FileText",
    howItWorks: [
      { step: 1, title: "Select PDF CV", text: "Drop your PDF resume or curriculum vitae file into the box." },
      { step: 2, title: "Instant Text Extraction", text: "The browser extracts text from all pages while preserving paragraph breaks." },
      { step: 3, title: "Copy or Download", text: "Copy specific sections or download the full raw text file with one click." }
    ],
    faq: [
      { q: "Why use a text extractor for job applications?", a: "Many company portals (Workday, Taleo, Greenhouse) require pasting individual experience paragraphs. Extracting raw text prevents annoying line break bugs." },
      { q: "What if my PDF is scanned?", a: "If your PDF was created by scanning paper, the extractor will notify you that the file contains image data rather than selectable text." }
    ],
    privacyNote: "Extracted text remains completely private in your browser.",
    relatedToolIds: ["cv-checker", "pdf-to-word", "compress-pdf"]
  },
  {
    id: "pdf-to-word",
    path: "/tools/pdf-to-word",
    category: "cv-tools",
    name: "PDF to Word",
    shortDesc: "Convert your PDF CV into an editable Microsoft Word (.docx) document.",
    h1: "Convert PDF to Editable Word (.docx)",
    metaTitle: "PDF to Word Converter for CVs | DexaCV",
    metaDesc: "Convert your PDF CV or document into an editable .docx Word file. Fast, free, and runs securely without sending files to third parties.",
    icon: "FileCode",
    howItWorks: [
      { step: 1, title: "Upload PDF", text: "Select the PDF file you wish to edit in Microsoft Word." },
      { step: 2, title: "Structure Reconstruction", text: "DexaCV parses headings, bullet points, and paragraphs into Word document blocks." },
      { step: 3, title: "Download DOCX", text: "Download your clean, fully editable .docx file instantly." }
    ],
    faq: [
      { q: "Can I open the downloaded file in Microsoft Word and Google Docs?", a: "Yes, the exported file is standard modern Office Open XML (.docx), compatible with Word, Google Docs, Pages, and LibreOffice." },
      { q: "Is formatting preserved?", a: "Headers, bullet points, and text hierarchies are automatically structured." }
    ],
    privacyNote: "Conversion happens on your device. Your documents are never retained.",
    relatedToolIds: ["cv-text-extractor", "compress-pdf", "cv-checker"]
  },
  {
    id: "cv-file-renamer",
    path: "/tools/cv-file-renamer",
    category: "cv-tools",
    name: "CV File Renamer",
    shortDesc: "Rename your CV using professional recruiter-recommended naming standards.",
    h1: "Professional CV & Resume File Renamer",
    metaTitle: "CV File Renamer – Standardize File Names | DexaCV",
    metaDesc: "Fix unprofessional filenames like 'CV_final_v2_edit.pdf'. Generate recruiter-friendly file names in seconds and download immediately.",
    icon: "FileSignature",
    howItWorks: [
      { step: 1, title: "Enter Details or Upload", text: "Type your name and target job title, or drop your CV." },
      { step: 2, title: "Choose Format", text: "Select from proven recruiter naming conventions." },
      { step: 3, title: "Download Renamed File", text: "Download your file with clean, professional metadata." }
    ],
    faq: [
      { q: "Why does the file name matter to recruiters?", a: "Recruiters download hundreds of CVs daily. Files named 'Resume.pdf' get lost. A file named 'Alex_Morgan_Senior_Engineer_CV.pdf' stands out immediately." },
      { q: "What is the best naming format?", a: "FirstName_LastName_CV.pdf or FirstName_LastName_Role_Resume.pdf are the gold standards." }
    ],
    privacyNote: "Renaming is done on your local computer without uploading.",
    relatedToolIds: ["cv-checker", "compress-pdf", "application-package-generator"]
  },

  // --- PDF Tools ---
  {
    id: "compress-pdf",
    path: "/tools/compress-pdf",
    category: "pdf-tools",
    name: "Compress PDF",
    shortDesc: "Reduce PDF file size for portal uploads and email attachments while preserving quality.",
    h1: "Compress PDF Files Online (Free & Private)",
    metaTitle: "Compress PDF File Size Online | DexaCV",
    metaDesc: "Reduce your PDF file size under 2MB for job applications, email attachments, and government portals. 100% private in-browser compression.",
    icon: "Minimize2",
    badge: "Popular",
    howItWorks: [
      { step: 1, title: "Upload PDF", text: "Select your PDF document or drag and drop it." },
      { step: 2, title: "Choose Compression Level", text: "Select Balanced (recommended for CVs) or Maximum compression." },
      { step: 3, title: "Download Smaller PDF", text: "See your file size reduction and download the lightweight PDF." }
    ],
    faq: [
      { q: "Will the text still look sharp?", a: "Yes. Balanced compression removes redundant internal PDF streams while preserving full vector typography sharpness." },
      { q: "What is the maximum file size job portals accept?", a: "Most portals (Taleo, BambooHR, Workday) set limits between 2MB and 5MB. Our tool easily brings files below that threshold." }
    ],
    privacyNote: "Files are compressed right inside your browser. Nothing is sent to our servers.",
    relatedToolIds: ["merge-pdf", "file-size-checker", "cv-checker"]
  },
  {
    id: "merge-pdf",
    path: "/tools/merge-pdf",
    category: "pdf-tools",
    name: "Merge PDF",
    shortDesc: "Combine your CV, cover letter, references, and certificates into a single neat document.",
    h1: "Merge PDF Documents into One File",
    metaTitle: "Merge PDF Files Online Free | DexaCV",
    metaDesc: "Combine multiple PDF files into one ordered document. Perfect for merging your CV, cover letter, and certificates into one application dossier.",
    icon: "Combine",
    howItWorks: [
      { step: 1, title: "Add PDF Files", text: "Upload two or more PDF files you want to combine." },
      { step: 2, title: "Order Your Pages", text: "Drag to rearrange files in your preferred sequence." },
      { step: 3, title: "Download Merged PDF", text: "Save the combined document as a single PDF ready to submit." }
    ],
    faq: [
      { q: "Can I merge CV and certificates together?", a: "Yes, combining your CV and diplomas or reference letters into a single PDF makes it easier for hiring managers to review your application." },
      { q: "Is there a page limit?", a: "You can merge dozens of pages comfortably in your browser." }
    ],
    privacyNote: "Merging executes entirely on your client device using web assembly.",
    relatedToolIds: ["split-pdf", "compress-pdf", "extract-pdf-pages", "application-package-generator"]
  },
  {
    id: "split-pdf",
    path: "/tools/split-pdf",
    category: "pdf-tools",
    name: "Split PDF",
    shortDesc: "Split a multi-page PDF into individual pages or specific page ranges.",
    h1: "Split PDF Pages Online",
    metaTitle: "Split PDF by Pages or Ranges | DexaCV",
    metaDesc: "Separate pages from any PDF document. Split into single-page files or custom page ranges like 1-2, 3-5.",
    icon: "Split",
    howItWorks: [
      { step: 1, title: "Select PDF", text: "Upload the multi-page PDF document you want to split." },
      { step: 2, title: "Specify Ranges", text: "Leave blank to extract all pages, or enter ranges like 1-2, 3-4." },
      { step: 3, title: "Download Separated PDFs", text: "Download individual split files directly." }
    ],
    faq: [
      { q: "Can I extract just page 1 of my CV?", a: "Yes, enter '1' in the page range or click the page to extract it individually." },
      { q: "Does splitting reduce quality?", a: "No, pages are copied losslessly with exact original resolution." }
    ],
    privacyNote: "Documents are processed locally in your browser memory.",
    relatedToolIds: ["merge-pdf", "extract-pdf-pages", "pdf-organizer"]
  },
  {
    id: "extract-pdf-pages",
    path: "/tools/extract-pdf-pages",
    category: "pdf-tools",
    name: "Extract PDF Pages",
    shortDesc: "Pick and extract exact pages from a document into a brand new PDF.",
    h1: "Extract Specific PDF Pages",
    metaTitle: "Extract PDF Pages Online | DexaCV",
    metaDesc: "Select and extract exact pages from any PDF file. Combine selected pages into a new compact document instantly.",
    icon: "FileCheck2",
    howItWorks: [
      { step: 1, title: "Choose PDF", text: "Select the document containing pages you need." },
      { step: 2, title: "Select Pages", text: "Click on the specific page numbers you want to keep." },
      { step: 3, title: "Create New PDF", text: "Generate a clean PDF containing only your selected pages." }
    ],
    faq: [
      { q: "How is this different from Split PDF?", a: "Split PDF separates documents into multiple files; Extract Pages bundles your chosen pages into a single new PDF." }
    ],
    privacyNote: "No data leaves your device.",
    relatedToolIds: ["split-pdf", "pdf-organizer", "rotate-pdf"]
  },
  {
    id: "jpg-to-pdf",
    path: "/tools/jpg-to-pdf",
    category: "pdf-tools",
    name: "JPG/PNG to PDF",
    shortDesc: "Convert images, certificate photos, and document scans into clean PDF pages.",
    h1: "Convert JPG & PNG Images to PDF",
    metaTitle: "Convert Images (JPG, PNG) to PDF | DexaCV",
    metaDesc: "Turn image files and document scans into a standardized, printable A4 or Letter PDF document with clean margins.",
    icon: "ImageDown",
    howItWorks: [
      { step: 1, title: "Upload Images", text: "Add one or multiple JPG or PNG images." },
      { step: 2, title: "Configure Layout", text: "Choose page size (A4 / Letter), orientation, and margins." },
      { step: 3, title: "Generate PDF", text: "Download a beautifully centered, professional PDF." }
    ],
    faq: [
      { q: "Can I convert multiple certificate photos at once?", a: "Yes, upload multiple pictures and they will be arranged neatly into consecutive pages." }
    ],
    privacyNote: "Image to PDF conversion is carried out entirely client-side.",
    relatedToolIds: ["pdf-to-jpg", "compress-pdf", "merge-pdf"]
  },
  {
    id: "pdf-to-jpg",
    path: "/tools/pdf-to-jpg",
    category: "pdf-tools",
    name: "PDF to JPG",
    shortDesc: "Export PDF pages into high-resolution JPG image files for sharing or previewing.",
    h1: "Convert PDF Pages to JPG Images",
    metaTitle: "Convert PDF to JPG High Resolution | DexaCV",
    metaDesc: "Export any PDF document pages into high-resolution JPG images. Download single pages or all pages instantly.",
    icon: "FileImage",
    howItWorks: [
      { step: 1, title: "Upload PDF", text: "Select your PDF file." },
      { step: 2, title: "Render Pages", text: "Each page is rendered at high resolution for maximum clarity." },
      { step: 3, title: "Download Images", text: "Download any page as a standalone image." }
    ],
    faq: [
      { q: "Are the images clear enough to read small text?", a: "Yes, pages are rendered at high DPI (up to 2x display scale) so fine print remains sharp." }
    ],
    privacyNote: "Conversion is done directly via HTML5 Canvas in your browser.",
    relatedToolIds: ["jpg-to-pdf", "compress-image", "resize-image"]
  },
  {
    id: "rotate-pdf",
    path: "/tools/rotate-pdf",
    category: "pdf-tools",
    name: "Rotate PDF",
    shortDesc: "Permanently rotate upside down or sideways PDF pages by 90°, 180°, or 270°.",
    h1: "Rotate PDF Pages Online Permanently",
    metaTitle: "Rotate PDF Pages Permanently | DexaCV",
    metaDesc: "Fix orientation of scanned documents and sideways certificate pages. Rotate by 90, 180, or 270 degrees and save.",
    icon: "RotateCw",
    howItWorks: [
      { step: 1, title: "Select PDF", text: "Drop your PDF into the rotation workspace." },
      { step: 2, title: "Rotate Pages", text: "Click rotate right or rotate left on individual pages or the entire document." },
      { step: 3, title: "Save PDF", text: "Download your PDF with corrected page orientations." }
    ],
    faq: [
      { q: "Will the rotation stay when someone else opens the PDF?", a: "Yes, the rotation angle is saved directly into the PDF specification." }
    ],
    privacyNote: "100% private. Files never leave your browser.",
    relatedToolIds: ["pdf-organizer", "compress-pdf", "extract-pdf-pages"]
  },
  {
    id: "pdf-organizer",
    path: "/tools/pdf-organizer",
    category: "pdf-tools",
    name: "PDF Page Organizer",
    shortDesc: "Reorder, rotate, and delete pages visually in an interactive page manager.",
    h1: "Visual PDF Page Organizer",
    metaTitle: "Organize, Reorder & Delete PDF Pages | DexaCV",
    metaDesc: "Visual tool to reorder pages, delete unwanted sheets, and rotate orientation in any PDF file before sending.",
    icon: "Layers",
    howItWorks: [
      { step: 1, title: "Upload Document", text: "View all pages rendered as interactive visual thumbnails." },
      { step: 2, title: "Reorder & Edit", text: "Move pages up or down, rotate orientation, or delete unwanted pages." },
      { step: 3, title: "Export Clean PDF", text: "Download your perfected, re-organized document." }
    ],
    faq: [
      { q: "Can I remove an accidental blank page at the end of my CV?", a: "Yes! Simply click the trash icon on the blank page and export." }
    ],
    privacyNote: "All thumbnail rendering and page operations run inside your browser.",
    relatedToolIds: ["split-pdf", "rotate-pdf", "merge-pdf"]
  },

  // --- Image Tools ---
  {
    id: "compress-image",
    path: "/tools/compress-image",
    category: "image-tools",
    name: "Compress Image",
    shortDesc: "Shrink profile photo and document image file sizes without noticeable quality loss.",
    h1: "Compress JPG, PNG & WebP Images",
    metaTitle: "Compress Images Online for CV & Web | DexaCV",
    metaDesc: "Reduce image file size by up to 80% while preserving visual clarity. Perfect for CV profile photos, portfolio images, and web uploads.",
    icon: "FileArchive",
    badge: "Fast",
    howItWorks: [
      { step: 1, title: "Drop Image", text: "Upload your JPG, PNG, or WebP photo." },
      { step: 2, title: "Adjust Quality", text: "Use the slider or target a specific file size in KB." },
      { step: 3, title: "Download", text: "Inspect the side-by-side size difference and save your optimized image." }
    ],
    faq: [
      { q: "What is the recommended size for a CV profile photo?", a: "Between 100KB and 300KB is ideal — crisp on retina screens while keeping the overall PDF size small." }
    ],
    privacyNote: "Processed locally with HTML5 Canvas. Your photos are never stored.",
    relatedToolIds: ["resize-image", "convert-image", "remove-background"]
  },
  {
    id: "resize-image",
    path: "/tools/resize-image",
    category: "image-tools",
    name: "Resize Image",
    shortDesc: "Resize images to custom pixel dimensions or standards like LinkedIn, Passport, and Avatars.",
    h1: "Resize Image to Exact Dimensions or Presets",
    metaTitle: "Resize Image Dimensions Online | DexaCV",
    metaDesc: "Quickly resize photos to exact width and height or popular presets like LinkedIn profile, passport photo, or CV avatar.",
    icon: "Scaling",
    howItWorks: [
      { step: 1, title: "Choose Image", text: "Select your image file." },
      { step: 2, title: "Select Preset or Custom Size", text: "Pick from LinkedIn Avatar (400x400), Passport (600x600), or enter custom pixels." },
      { step: 3, title: "Save Resized Image", text: "Download your resized picture instantly." }
    ],
    faq: [
      { q: "Does it keep the aspect ratio?", a: "Yes, you can lock the aspect ratio or specify custom exact dimensions." }
    ],
    privacyNote: "No photos are uploaded to any server.",
    relatedToolIds: ["compress-image", "crop-image", "convert-image"]
  },
  {
    id: "convert-image",
    path: "/tools/convert-image",
    category: "image-tools",
    name: "Convert Image",
    shortDesc: "Convert image formats between JPG, PNG, and WebP instantly in your browser.",
    h1: "Convert Image Formats (JPG, PNG, WebP)",
    metaTitle: "Image Format Converter | DexaCV",
    metaDesc: "Convert your pictures between JPG, PNG, and modern WebP formats in seconds. Clean, fast, and free.",
    icon: "RefreshCcw",
    howItWorks: [
      { step: 1, title: "Upload Image", text: "Drop your image into the converter." },
      { step: 2, title: "Choose Format", text: "Select JPG, PNG, or WebP." },
      { step: 3, title: "Download", text: "Get your converted file right away." }
    ],
    faq: [
      { q: "When should I use PNG vs JPG for my CV?", a: "Use PNG if you need transparent backgrounds or sharp line art (like signatures); use JPG for photo portraits to keep file size small." }
    ],
    privacyNote: "100% in-browser conversion.",
    relatedToolIds: ["compress-image", "resize-image", "jpg-to-pdf"]
  },
  {
    id: "crop-image",
    path: "/tools/crop-image",
    category: "image-tools",
    name: "Crop Image",
    shortDesc: "Crop your headshot or photo to square, circular, or custom aspect ratios.",
    h1: "Crop Profile Photos & Images Online",
    metaTitle: "Crop Headshots & Images Online | DexaCV",
    metaDesc: "Crop and frame your profile picture for CVs, LinkedIn, and portfolios. Square 1:1, 4:3, and custom crop tools.",
    icon: "Crop",
    howItWorks: [
      { step: 1, title: "Select Photo", text: "Upload your portrait or picture." },
      { step: 2, title: "Frame Your Crop", text: "Adjust the crop box to frame your face or subject." },
      { step: 3, title: "Download", text: "Save the cleanly cropped image." }
    ],
    faq: [
      { q: "What is the best crop ratio for a CV headshot?", a: "A square 1:1 or 4:5 portrait ratio centered on your head and shoulders works best." }
    ],
    privacyNote: "Processed in memory without sending data over the network.",
    relatedToolIds: ["resize-image", "compress-image", "remove-background"]
  },
  {
    id: "remove-background",
    path: "/tools/remove-background",
    category: "image-tools",
    name: "Remove Image Background",
    shortDesc: "Remove or replace cluttered backgrounds on headshots with clean white or transparent.",
    h1: "Remove or Clean Photo Background",
    metaTitle: "Clean Photo Background for CV & Profile | DexaCV",
    metaDesc: "Turn busy background portraits into clean transparent or solid white studio headshots for CVs, badges, and professional profiles.",
    icon: "Eraser",
    howItWorks: [
      { step: 1, title: "Upload Headshot", text: "Drop your portrait or profile picture." },
      { step: 2, title: "Select Backdrop", text: "Choose Transparent, Crisp Studio White, or Professional Soft Blue." },
      { step: 3, title: "Download", text: "Save your professionalized portrait image." }
    ],
    faq: [
      { q: "Why should I clean the background of my CV photo?", a: "Hiring managers prefer photos that look like professional studio headshots rather than casual snapshots with distracting home or outdoor backgrounds." }
    ],
    privacyNote: "Runs client-side in your browser.",
    relatedToolIds: ["signature-image", "compress-image", "crop-image"]
  },
  {
    id: "signature-image",
    path: "/tools/signature-image",
    category: "image-tools",
    name: "Signature Image Cleaner",
    shortDesc: "Turn a phone photo of your paper pen signature into a clean, transparent vector PNG.",
    h1: "Signature Image Cleaner for Documents & CVs",
    metaTitle: "Transparent Signature Image Creator | DexaCV",
    metaDesc: "Photograph your pen signature on paper and instantly convert it into a clean, transparent background PNG ready to insert into CVs and contracts.",
    icon: "PenTool",
    badge: "Useful",
    howItWorks: [
      { step: 1, title: "Photograph Your Signature", text: "Sign on a piece of white paper and snap a photo with your phone." },
      { step: 2, title: "Automatic Paper Removal", text: "Our algorithm removes the gray paper background and shadows while deepening the ink strokes." },
      { step: 3, title: "Download Transparent PNG", text: "Save a clean, transparent PNG signature to place in documents." }
    ],
    faq: [
      { q: "How do I get the best results?", a: "Use a dark blue or black pen on plain white paper under good lighting, then upload the photo here." },
      { q: "Is the signature saved anywhere?", a: "Never. Because signatures are sensitive, all pixel processing runs exclusively in your browser memory." }
    ],
    privacyNote: "Strict privacy guarantee: Signatures are processed in your browser memory and never transmitted or saved.",
    relatedToolIds: ["remove-background", "convert-image", "cv-checker"]
  },

  // --- Application Tools ---
  {
    id: "job-description-analyzer",
    path: "/tools/job-description-analyzer",
    category: "application-tools",
    name: "Job Description Analyzer",
    shortDesc: "Paste a job spec to extract required skills, keywords, and compare them against your CV.",
    h1: "Job Description & Keyword Match Analyzer",
    metaTitle: "Job Description Keyword Analyzer | DexaCV",
    metaDesc: "Analyze any job description to uncover key skills, responsibilities, and keyword density. Compare against your CV to tailor your application.",
    icon: "SearchCode",
    badge: "AI Assist",
    howItWorks: [
      { step: 1, title: "Paste Job Description", text: "Copy and paste the job posting or requirements into the box." },
      { step: 2, title: "Select or Paste Your CV", text: "Use your existing DexaCV profile or paste text." },
      { step: 3, title: "Review Match Breakdown", text: "See matching keywords, missing terms, and practical advice to tailor your CV." }
    ],
    faq: [
      { q: "How does keyword matching help my application?", a: "Applicant Tracking Systems scan for terms specified in the job posting. Making sure relevant skills are represented increases your odds of passing initial filters." },
      { q: "Is the match score an official guarantee?", a: "No. The match score is an algorithmic guide to help you verify that your CV speaks the same terminology as the employer." }
    ],
    privacyNote: "Text is processed in-memory for your session.",
    relatedToolIds: ["cover-letter-generator", "cv-checker", "application-email-generator"]
  },
  {
    id: "cover-letter-generator",
    path: "/tools/cover-letter-generator",
    category: "application-tools",
    name: "Cover Letter Generator",
    shortDesc: "Generate targeted, persuasive cover letters tailored to your role, company, and CV.",
    h1: "Tailored Cover Letter Generator",
    metaTitle: "Professional Cover Letter Generator | DexaCV",
    metaDesc: "Create compelling, customized cover letters tailored to your specific background and the target role. Export to PDF, Word, or copy instantly.",
    icon: "MailQuestion",
    badge: "Recommended",
    howItWorks: [
      { step: 1, title: "Input Position & Company", text: "Enter the job title, employer, and optionally paste the job posting." },
      { step: 2, title: "Select Tone & Language", text: "Choose from Confident, Concise, Formal, or Creative tones." },
      { step: 3, title: "Edit & Export", text: "Fine-tune the draft in the interactive editor and download as PDF or DOCX." }
    ],
    faq: [
      { q: "Does it invent fake achievements?", a: "Never. DexaCV strictly forbids fabricating metrics or experience you did not have. It organizes your real strengths into persuasive prose." },
      { q: "Can I save multiple cover letters?", a: "Yes, you can save and manage cover letters directly in your local DexaCV workspace." }
    ],
    privacyNote: "Generated letters are stored locally in your browser storage.",
    relatedToolIds: ["job-description-analyzer", "application-email-generator", "cv-checker"]
  },
  {
    id: "application-email-generator",
    path: "/tools/application-email-generator",
    category: "application-tools",
    name: "Application Email Generator",
    shortDesc: "Generate polite, high-response email messages for job applications, follow-ups, and inquiries.",
    h1: "Job Application Email Generator",
    metaTitle: "Job Application Email Generator & Follow-Up Templates | DexaCV",
    metaDesc: "Generate professional job application cover emails, follow-up notes, and speculative inquiry messages with 1-click clipboard copy.",
    icon: "Send",
    howItWorks: [
      { step: 1, title: "Select Scenario", text: "Choose Applying for Role, Follow-up After Interview, or Speculative Inquiry." },
      { step: 2, title: "Enter Names & Role", text: "Fill in the recipient and target position." },
      { step: 3, title: "Copy Subject & Body", text: "Copy directly into Gmail, Outlook, or your preferred mail client." }
    ],
    faq: [
      { q: "What should I write in an email when attaching a CV?", a: "Keep it brief (3-4 paragraphs) stating the role, why you're interested, key qualifications, and an invitation to speak." }
    ],
    privacyNote: "Email generation runs purely in your browser.",
    relatedToolIds: ["cover-letter-generator", "application-package-generator", "cv-file-renamer"]
  },
  {
    id: "application-package-generator",
    path: "/tools/application-package-generator",
    category: "application-tools",
    name: "Application Package Generator",
    shortDesc: "Assemble your CV, cover letter, certificates, and photo into a standardized dossier.",
    h1: "Job Application Package & Dossier Generator",
    metaTitle: "Application Package & Dossier Generator | DexaCV",
    metaDesc: "Combine your CV, cover letter, certificates, and headshot. Checks total file size, standardizes names, and packages files for sending.",
    icon: "PackageCheck",
    howItWorks: [
      { step: 1, title: "Select Files", text: "Attach your CV, Cover Letter, Diplomas/Certificates, and optional photo." },
      { step: 2, title: "Verify Size & Names", text: "Our tool checks if the total size is safe for email (under 5MB) and renames files cleanly." },
      { step: 3, title: "Merge or Download ZIP", text: "Download a combined application dossier PDF or a clean ZIP package." }
    ],
    faq: [
      { q: "Why should I package my application documents together?", a: "German, Swiss, European, and many multinational employers expect a complete Bewerbungsmappe (application package). Having everything unified demonstrates professionalism." }
    ],
    privacyNote: "All packaging and file merging takes place on your device.",
    relatedToolIds: ["merge-pdf", "compress-pdf", "cv-file-renamer", "file-size-checker"]
  },
  {
    id: "qr-code-generator",
    path: "/tools/qr-code-generator",
    category: "application-tools",
    name: "QR Code Generator",
    shortDesc: "Generate clean QR codes for your LinkedIn, portfolio, GitHub, or online profile to place on your CV.",
    h1: "CV QR Code Generator (LinkedIn & Portfolio)",
    metaTitle: "QR Code Generator for CV & Resume | DexaCV",
    metaDesc: "Create sharp, scannable QR codes for your LinkedIn URL, portfolio, GitHub, or vCard. Download high-resolution PNG or SVG to place on your CV.",
    icon: "QrCode",
    howItWorks: [
      { step: 1, title: "Enter URL or Profile Link", text: "Paste your LinkedIn, website, or digital portfolio link." },
      { step: 2, title: "Customize Appearance", text: "Adjust size, dark/light colors, and margin." },
      { step: 3, title: "Download PNG or SVG", text: "Save the image and insert it directly into your CV header or contact section." }
    ],
    faq: [
      { q: "Is it good practice to put a QR code on a printed CV?", a: "Yes! When recruiters or interviewers hold a printed copy, a QR code lets them scan with their smartphone and view your live portfolio or LinkedIn in 2 seconds." },
      { q: "Do these QR codes expire?", a: "No! These are standard static QR codes that encode your URL directly into the matrix. They never expire and require no redirect service." }
    ],
    privacyNote: "Generated directly in your browser.",
    relatedToolIds: ["cv-checker", "compress-image", "resize-image"]
  },

  // --- General Utility ---
  {
    id: "file-size-checker",
    path: "/tools/file-size-checker",
    category: "pdf-tools",
    name: "File Size Checker",
    shortDesc: "Check file sizes, page counts, and dimensions to verify upload portal compliance.",
    h1: "Application Document File Size Checker",
    metaTitle: "File Size & Portal Compatibility Checker | DexaCV",
    metaDesc: "Check whether your CV or document meets file size limits for job portals like Workday, Taleo, and government sites. Instant 1-click compression shortcuts.",
    icon: "Gauge",
    howItWorks: [
      { step: 1, title: "Drop Any File", text: "Upload your PDF, DOCX, or image." },
      { step: 2, title: "Instant Size Audit", text: "See exact bytes, megabytes, dimensions, and portal status." },
      { step: 3, title: "Direct Fix Shortcut", text: "Click to compress or optimize immediately if your file is too large." }
    ],
    faq: [
      { q: "What is the standard upload limit for most job portals?", a: "Standard limits are 2MB to 5MB. Files above 5MB often trigger silent upload failures." }
    ],
    privacyNote: "Tested completely inside your browser.",
    relatedToolIds: ["compress-pdf", "compress-image", "application-package-generator"]
  }
];

export function getToolById(id) {
  return ALL_TOOLS.find((t) => t.id === id);
}

export function getToolsByCategory(catId) {
  return ALL_TOOLS.filter((t) => t.category === catId);
}
