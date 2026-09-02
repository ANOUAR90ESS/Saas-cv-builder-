// Template registry. Each template is a React component receiving { cv } and
// rendering an A4 document. Adding a template = add a file + register here.
import Modern from "@/components/cv/templates/Modern";
import Professional from "@/components/cv/templates/Professional";
import Minimal from "@/components/cv/templates/Minimal";
import Ats from "@/components/cv/templates/Ats";
import Executive from "@/components/cv/templates/Executive";
import Creative from "@/components/cv/templates/Creative";
import Classic from "@/components/cv/templates/Classic";
import Elegant from "@/components/cv/templates/Elegant";
import Bold from "@/components/cv/templates/Bold";
import Tech from "@/components/cv/templates/Tech";
import Compact from "@/components/cv/templates/Compact";
import Timeline from "@/components/cv/templates/Timeline";
import Midnight from "@/components/cv/templates/Midnight";
import Gradient from "@/components/cv/templates/Gradient";
import Crisp from "@/components/cv/templates/Crisp";
import Pillared from "@/components/cv/templates/Pillared";
import Magazine from "@/components/cv/templates/Magazine";
import Card from "@/components/cv/templates/Card";
import Underline from "@/components/cv/templates/Underline";
import Geometric from "@/components/cv/templates/Geometric";
import Navy from "@/components/cv/templates/Navy";
import Split from "@/components/cv/templates/Split";
import Aurora from "@/components/cv/templates/Aurora";
import Neon from "@/components/cv/templates/Neon";
import Bento from "@/components/cv/templates/Bento";
import Holo from "@/components/cv/templates/Holo";
import Carbon from "@/components/cv/templates/Carbon";
import Pastel from "@/components/cv/templates/Pastel";
import Brutalist from "@/components/cv/templates/Brutalist";
import Wave from "@/components/cv/templates/Wave";
import Prism from "@/components/cv/templates/Prism";
import Mono from "@/components/cv/templates/Mono";
import Glass from "@/components/cv/templates/Glass";
import Editorial from "@/components/cv/templates/Editorial";
import Dots from "@/components/cv/templates/Dots";
import Gradientbar from "@/components/cv/templates/Gradientbar";
import Outline from "@/components/cv/templates/Outline";
import Confetti from "@/components/cv/templates/Confetti";
import Minimalmono from "@/components/cv/templates/Minimalmono";
import Vibrant from "@/components/cv/templates/Vibrant";
import Softneo from "@/components/cv/templates/Softneo";
import Techneo from "@/components/cv/templates/Techneo";
import Stack from "@/components/cv/templates/Stack";
import Canvas from "@/components/cv/templates/Canvas";
import Apex from "@/components/cv/templates/Apex";
import NordicClean from "@/components/template-library/templates/NordicClean";
import ApexExecutive from "@/components/template-library/templates/ApexExecutive";
import AtsMax from "@/components/template-library/templates/AtsMax";

export const TEMPLATES = [
  { id: "modern", name: "Modern", category: "Modern", component: Modern, description: "Contemporary two-column layout with a colored sidebar." },
  { id: "professional", name: "Professional", category: "Professional", component: Professional, description: "Clean corporate single-column design with accent rules." },
  { id: "minimal", name: "Minimal", category: "Minimal", component: Minimal, description: "Generous whitespace and restrained typography." },
  { id: "ats", name: "ATS Friendly", category: "ATS Friendly", component: Ats, description: "Simple structure optimised for applicant tracking systems." },
  { id: "executive", name: "Executive", category: "Executive", component: Executive, description: "Elegant serif header for senior professionals." },
  { id: "creative", name: "Creative", category: "Creative", component: Creative, description: "Bold header band and confident visual hierarchy." },
  { id: "classic", name: "Classic", category: "Classic", component: Classic, description: "Traditional serif resume with ruled section titles." },
  { id: "elegant", name: "Elegant", category: "Elegant", component: Elegant, description: "Refined serif with hairline accents and small-caps labels." },
  { id: "bold", name: "Bold", category: "Creative", component: Bold, description: "High-contrast color blocks and strong accent bars." },
  { id: "tech", name: "Tech", category: "Modern", component: Tech, description: "Developer-style two-column with monospaced labels and skill bars." },
  { id: "compact", name: "Compact", category: "Minimal", component: Compact, description: "Dense layout that fits more content per page." },
  { id: "timeline", name: "Timeline", category: "Professional", component: Timeline, description: "Vertical timeline that highlights career progression." },
  { id: "midnight", name: "Midnight", category: "Modern", component: Midnight, description: "Inverted dark sidebar with light content — a bold, modern contrast." },
  { id: "gradient", name: "Gradient", category: "Creative", component: Gradient, description: "Vibrant gradient header band flowing into a clean body." },
  { id: "crisp", name: "Crisp", category: "Minimal", component: Crisp, description: "Pale two-column rail with a thin accent border and restrained color." },
  { id: "pillared", name: "Pillared", category: "Elegant", component: Pillared, description: "Centered elegant single column with a vertical accent pillar." },
  { id: "magazine", name: "Magazine", category: "Creative", component: Magazine, description: "Editorial three-column top row with a ruled name band." },
  { id: "card", name: "Card", category: "Modern", component: Card, description: "Each section in its own rounded card with soft shadow." },
  { id: "underline", name: "Underline", category: "Professional", component: Underline, description: "Strong typographic hierarchy with thick accent underlines." },
  { id: "geometric", name: "Geometric", category: "Creative", component: Geometric, description: "Angled color block header with confident geometric accents." },
  { id: "navy", name: "Navy & Gold", category: "Executive", component: Navy, description: "Formal corporate look: navy headings with thin gold rules." },
  { id: "split", name: "Split", category: "Professional", component: Split, description: "Full-width name band over a narrow sidebar and main content." },
  { id: "aurora", name: "Aurora", category: "Creative", component: Aurora, description: "Soft multi-stop gradient header flowing into a clean body." },
  { id: "neon", name: "Neon", category: "Modern", component: Neon, description: "Dark header with a glowing neon accent and monospace labels." },
  { id: "bento", name: "Bento", category: "Modern", component: Bento, description: "Modular bento-grid header tiles for a modern, app-like feel." },
  { id: "holo", name: "Holographic", category: "Creative", component: Holo, description: "Iridescent conic-gradient header band." },
  { id: "carbon", name: "Carbon", category: "Modern", component: Carbon, description: "Dark carbon header with a bold amber accent rail." },
  { id: "pastel", name: "Pastel", category: "Creative", component: Pastel, description: "Soft pastel rounded header card — gentle and modern." },
  { id: "brutalist", name: "Brutalist", category: "Creative", component: Brutalist, description: "Raw thick borders and bold uppercase type." },
  { id: "wave", name: "Wave", category: "Creative", component: Wave, description: "Colored header with a playful SVG wave divider." },
  { id: "prism", name: "Prism", category: "Creative", component: Prism, description: "Angled prism color block cutting across the header." },
  { id: "mono", name: "Mono", category: "Minimal", component: Mono, description: "All-monospace, structured and minimal." },
  { id: "glass", name: "Glass", category: "Modern", component: Glass, description: "Frosted glass header card over a soft gradient page." },
  { id: "editorial", name: "Editorial", category: "Creative", component: Editorial, description: "Magazine-style huge serif name and ruled headings." },
  { id: "dots", name: "Dots", category: "Creative", component: Dots, description: "Header set on a subtle dot-grid pattern." },
  { id: "gradientbar", name: "Gradient Bar", category: "Modern", component: Gradientbar, description: "Thin gradient top bar over a clean, airy layout." },
  { id: "outline", name: "Outline", category: "Creative", component: Outline, description: "Name in a bold outlined uppercase box." },
  { id: "confetti", name: "Confetti", category: "Creative", component: Confetti, description: "Playful scattered accent dots and pill headings." },
  { id: "minimalmono", name: "Minimal Mono", category: "Minimal", component: Minimalmono, description: "Ultra-minimal monospace with generous whitespace." },
  { id: "vibrant", name: "Vibrant", category: "Creative", component: Vibrant, description: "Bold solid color block header with confident type." },
  { id: "softneo", name: "Soft Neo", category: "Modern", component: Softneo, description: "Soft rounded teal header card — calm and contemporary." },
  { id: "techneo", name: "Tech Neo", category: "Modern", component: Techneo, description: "Dark gradient tech header with monospace accents." },
  { id: "stack", name: "Stack", category: "Modern", component: Stack, description: "Clean single-column tech layout with monospace labels and skill chips." },
  { id: "canvas", name: "Canvas", category: "Creative", component: Canvas, description: "Rounded accent header card with marker-led sections — modern creative." },
  { id: "apex", name: "Apex", category: "Professional", component: Apex, description: "Professional two-column with a hairline divider and clean tech hierarchy." },
  { id: "nordic", name: "Nordic Clean", category: "Minimal", component: NordicClean, description: "Airy Scandinavian minimalism with crisp line dividers and subtle tag accents." },
  { id: "apex_executive", name: "Apex Executive", category: "Executive", component: ApexExecutive, description: "Authoritative serif layout engineered for leadership and executive roles." },
  { id: "atsmax", name: "ATS Max Benchmark", category: "ATS Friendly", component: AtsMax, description: "Engineered specifically for 100% simulated ATS Benchmark pass rate and parsing reliability." },
];

export const CATEGORIES = ["All", "Professional", "Modern", "Minimal", "Creative", "Executive", "Elegant", "Classic", "ATS Friendly"];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}