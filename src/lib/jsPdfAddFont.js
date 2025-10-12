import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// import { timesBold, timesNormal, timesItalic } from '../assets/fonts/base64/svn-times'
import { timesRegular, timesBold, timesItalic, timesBoldItalic } from '../assets/fonts/base64/times'
import { normalArial, boldArial ,italicArial} from '../assets/fonts/base64/arial'
import { opensansNormal} from '../assets/fonts/base64/opensans'
export const jsPDFCus = (orientation, unit, format) => {
  const doc = new jsPDF(orientation, unit, format)

  doc.addFileToVFS('OpenSans-Regular.ttf', opensansNormal)
  doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal')
  // doc.addFileToVFS('OpenSans-Bold.ttf', opensansBold)
  // doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold')
  // doc.addFileToVFS('OpenSans-Medium.ttf', opensansMedium)
  // doc.addFont('OpenSans-Medium.ttf', 'OpenSans', 'medium')

  //   doc.addFileToVFS('SVN-Times-New-Roman.ttf', timesNormal)
  //   doc.addFont('SVN-Times-New-Roman.ttf', 'SVN Times New Roman', 'normal')
  //   doc.addFileToVFS('SVN-Times-New-Roman-Bold.ttf', timesBold)
  //   doc.addFont('SVN-Times-New-Roman-Bold.ttf', 'SVN Times New Roman', 'bold')
  //   doc.addFileToVFS('SVN-Times-New-Roman-Italic.ttf', timesItalic)
  //   doc.addFont('SVN-Times-New-Roman-Italic.ttf', 'SVN Times New Roman', 'italic')

  doc.addFileToVFS('Arial.ttf', normalArial)
  doc.addFont('Arial.ttf', 'Arial', 'normal')
  doc.addFileToVFS('Arial_Bold.ttf', boldArial)
  doc.addFont('Arial_Bold.ttf', 'Arial', 'bold')
  doc.addFileToVFS('Arial_Italic.ttf', italicArial)
  doc.addFont('Arial_Italic.ttf', 'Arial', 'italic')

  doc.addFileToVFS('times.ttf', timesRegular)
  doc.addFont('times.ttf', 'times', 'normal')
  doc.addFileToVFS('timesbd.ttf', timesBold)
  doc.addFont('timesbd.ttf', 'times', 'bold')
  doc.addFileToVFS('timesi.ttf', timesItalic)
  doc.addFont('timesi.ttf', 'times', 'italic')
  doc.addFileToVFS('timesbi.ttf', timesBoldItalic);
  doc.addFont('timesbi.ttf', 'times', 'bolditalic');

  // Add autoTable method to the document
  doc.autoTable = autoTable

  return doc
}
