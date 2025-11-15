// This declares the pdfjsLib object from the CDN script for TypeScript
declare const pdfjsLib: any;

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a PDF file into an array of base64 encoded images, one for each page.
 * @param file The PDF file.
 * @returns A promise that resolves with an array of base64 strings.
 */
const convertPdfToImagesBase64 = async (file: File): Promise<string[]> => {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('pdf.js library is not loaded. Please check the script tag in index.html.');
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const fileArrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;
  const numPages = pdf.numPages;
  const imagePromises: Promise<string>[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      // Convert canvas to base64 and push promise to array
      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
      imagePromises.push(Promise.resolve(base64Image));
    }
  }

  return Promise.all(imagePromises);
};

/**
 * Reads a text file and returns its content as a string.
 * @param file The text file.
 * @returns A promise that resolves with the file's text content.
 */
const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};


/**
 * Prepares a file for Gemini by converting it to the appropriate format.
 * Images are converted to base64. PDFs are converted to an array of base64 images.
 * Text files are read as plain text.
 * @param file The file to process.
 * @returns An object containing the base64 data for media files or text content for text files.
 */
export const prepareFileForGemini = async (file: File): Promise<{ parts: { inlineData: { data: string; mimeType: string; } }[], text?: string }> => {
  if (file.type.startsWith('image/')) {
    const data = await fileToBase64(file);
    return {
        parts: [{
            inlineData: { data, mimeType: file.type }
        }]
    };
  } else if (file.type === 'application/pdf') {
    const imageDatas = await convertPdfToImagesBase64(file);
    return {
        parts: imageDatas.map(data => ({
            inlineData: { data, mimeType: 'image/jpeg'}
        }))
    };
  } else if (file.type === 'text/plain') {
    const text = await fileToText(file);
    return { parts: [], text };
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
};