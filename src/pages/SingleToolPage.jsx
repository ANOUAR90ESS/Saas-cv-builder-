import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { getToolById } from "../tools/toolsData";
import ToolPageLayout from "../components/tools/ToolPageLayout";

// Tools
import CvCheckerTool from "../components/tools/CvCheckerTool";
import CvTextExtractorTool from "../components/tools/CvTextExtractorTool";
import PdfToWordTool from "../components/tools/PdfToWordTool";
import CvFileRenamerTool from "../components/tools/CvFileRenamerTool";
import CompressPdfTool from "../components/tools/CompressPdfTool";
import MergePdfTool from "../components/tools/MergePdfTool";
import SplitPdfTool from "../components/tools/SplitPdfTool";
import ExtractPdfPagesTool from "../components/tools/ExtractPdfPagesTool";
import JpgToPdfTool from "../components/tools/JpgToPdfTool";
import PdfToJpgTool from "../components/tools/PdfToJpgTool";
import RotatePdfTool from "../components/tools/RotatePdfTool";
import PdfOrganizerTool from "../components/tools/PdfOrganizerTool";
import CompressImageTool from "../components/tools/CompressImageTool";
import ResizeImageTool from "../components/tools/ResizeImageTool";
import ConvertImageTool from "../components/tools/ConvertImageTool";
import CropImageTool from "../components/tools/CropImageTool";
import RemoveBackgroundTool from "../components/tools/RemoveBackgroundTool";
import SignatureImageTool from "../components/tools/SignatureImageTool";
import JobDescriptionAnalyzerTool from "../components/tools/JobDescriptionAnalyzerTool";
import CoverLetterGeneratorTool from "../components/tools/CoverLetterGeneratorTool";
import ApplicationEmailGeneratorTool from "../components/tools/ApplicationEmailGeneratorTool";
import ApplicationPackageGeneratorTool from "../components/tools/ApplicationPackageGeneratorTool";
import QrCodeGeneratorTool from "../components/tools/QrCodeGeneratorTool";
import FileSizeCheckerTool from "../components/tools/FileSizeCheckerTool";

const COMPONENT_MAP = {
  "cv-checker": CvCheckerTool,
  "cv-text-extractor": CvTextExtractorTool,
  "pdf-to-word": PdfToWordTool,
  "cv-file-renamer": CvFileRenamerTool,
  "compress-pdf": CompressPdfTool,
  "merge-pdf": MergePdfTool,
  "split-pdf": SplitPdfTool,
  "extract-pdf-pages": ExtractPdfPagesTool,
  "jpg-to-pdf": JpgToPdfTool,
  "pdf-to-jpg": PdfToJpgTool,
  "rotate-pdf": RotatePdfTool,
  "pdf-organizer": PdfOrganizerTool,
  "compress-image": CompressImageTool,
  "resize-image": ResizeImageTool,
  "convert-image": ConvertImageTool,
  "crop-image": CropImageTool,
  "remove-background": RemoveBackgroundTool,
  "signature-image": SignatureImageTool,
  "job-description-analyzer": JobDescriptionAnalyzerTool,
  "cover-letter-generator": CoverLetterGeneratorTool,
  "application-email-generator": ApplicationEmailGeneratorTool,
  "application-package-generator": ApplicationPackageGeneratorTool,
  "qr-code-generator": QrCodeGeneratorTool,
  "file-size-checker": FileSizeCheckerTool
};

export default function SingleToolPage({ explicitToolId }) {
  const params = useParams();
  const toolId = explicitToolId || params.toolId;
  const tool = getToolById(toolId);

  if (!tool) {
    return <Navigate to="/tools" replace />;
  }

  const ToolComponent = COMPONENT_MAP[tool.id];

  return (
    <ToolPageLayout tool={tool}>
      {ToolComponent ? <ToolComponent /> : <div>Tool component coming soon</div>}
    </ToolPageLayout>
  );
}
