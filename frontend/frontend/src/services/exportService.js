// Export Service for handling data exports
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

class ExportService {
  // Export to Excel
  exportToExcel(data, filename = 'export') {
    try {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      
      // Style the header row
      const range = XLSX.utils.decode_range(ws['!ref'])
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1'
        if (!ws[address]) continue
        ws[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center' }
        }
      }
      
      XLSX.writeFile(wb, `${filename}.xlsx`)
      return true
    } catch (error) {
      console.error('Excel export error:', error)
      return false
    }
  }

  // Export to CSV
  exportToCSV(data, filename = 'export') {
    try {
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value ?? ''
          }).join(',')
        )
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      return true
    } catch (error) {
      console.error('CSV export error:', error)
      return false
    }
  }

  // Export to PDF
  exportToPDF(data, filename = 'export', options = {}) {
    try {
      const doc = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      // Add title
      doc.setFontSize(18)
      doc.text(options.title || 'Báo cáo dữ liệu', 14, 15)
      
      // Add metadata
      doc.setFontSize(10)
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 14, 25)
      if (options.author) {
        doc.text(`Người xuất: ${options.author}`, 14, 30)
      }
      
      // Prepare table data
      const headers = Object.keys(data[0] || {})
      const tableData = data.map(row => headers.map(h => row[h] ?? ''))
      
      // Add table
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [68, 114, 196] },
        styles: { 
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: options.columnStyles || {}
      })
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Trang ${i} / ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }
      
      doc.save(`${filename}.pdf`)
      return true
    } catch (error) {
      console.error('PDF export error:', error)
      return false
    }
  }

  // Generate sample data
  generateSampleData(type = 'attendance') {
    const sampleData = {
      attendance: [
        {
          mssv: 'SV001',
          name: 'Nguyễn Văn An',
          email: 'an.nguyen@student.edu.vn',
          phone: '0901234567',
          attendance: 'Có mặt',
          attendance_rate: '95%',
          grade: '8.5',
          notes: 'Sinh viên chăm chỉ',
          last_checkin: '08:15 15/12/2024'
        },
        {
          mssv: 'SV002',
          name: 'Trần Thị Bình',
          email: 'binh.tran@student.edu.vn',
          phone: '0902345678',
          attendance: 'Có mặt',
          attendance_rate: '88%',
          grade: '7.8',
          notes: 'Tham gia tích cực',
          last_checkin: '08:20 15/12/2024'
        },
        {
          mssv: 'SV003',
          name: 'Lê Văn Cường',
          email: 'cuong.le@student.edu.vn',
          phone: '0903456789',
          attendance: 'Vắng',
          attendance_rate: '75%',
          grade: '6.5',
          notes: 'Cần cải thiện',
          last_checkin: 'N/A'
        },
        {
          mssv: 'SV004',
          name: 'Phạm Thị Dung',
          email: 'dung.pham@student.edu.vn',
          phone: '0904567890',
          attendance: 'Muộn',
          attendance_rate: '82%',
          grade: '7.2',
          notes: '',
          last_checkin: '08:35 15/12/2024'
        },
        {
          mssv: 'SV005',
          name: 'Hoàng Văn Em',
          email: 'em.hoang@student.edu.vn',
          phone: '0905678901',
          attendance: 'Có mặt',
          attendance_rate: '92%',
          grade: '8.0',
          notes: 'Tiến bộ tốt',
          last_checkin: '08:10 15/12/2024'
        }
      ],
      grades: [
        {
          mssv: 'SV001',
          name: 'Nguyễn Văn An',
          midterm: '8.0',
          final: '8.5',
          assignment: '9.0',
          total: '8.5',
          grade: 'A'
        },
        {
          mssv: 'SV002',
          name: 'Trần Thị Bình',
          midterm: '7.5',
          final: '8.0',
          assignment: '7.8',
          total: '7.8',
          grade: 'B+'
        },
        {
          mssv: 'SV003',
          name: 'Lê Văn Cường',
          midterm: '6.0',
          final: '6.5',
          assignment: '7.0',
          total: '6.5',
          grade: 'C+'
        }
      ],
      classes: [
        {
          id: 'CS101',
          name: 'Lập trình cơ bản',
          students: 45,
          sessions: 30,
          attendance_rate: '85%',
          status: 'Đang diễn ra'
        },
        {
          id: 'CS102',
          name: 'Cấu trúc dữ liệu',
          students: 38,
          sessions: 28,
          attendance_rate: '88%',
          status: 'Đang diễn ra'
        },
        {
          id: 'CS201',
          name: 'Cơ sở dữ liệu',
          students: 42,
          sessions: 32,
          attendance_rate: '82%',
          status: 'Hoàn thành'
        }
      ]
    }
    
    return sampleData[type] || sampleData.attendance
  }

  // Export with selected columns
  exportWithColumns(data, columns, format = 'excel', filename = 'export') {
    const filteredData = data.map(row => {
      const filteredRow = {}
      columns.forEach(col => {
        if (row.hasOwnProperty(col)) {
          filteredRow[col] = row[col]
        }
      })
      return filteredRow
    })
    
    switch(format) {
      case 'csv':
        return this.exportToCSV(filteredData, filename)
      case 'pdf':
        return this.exportToPDF(filteredData, filename)
      default:
        return this.exportToExcel(filteredData, filename)
    }
  }

  // Export attendance report
  exportAttendanceReport(classData, format = 'pdf') {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `attendance_${classData.classId}_${timestamp}`
    
    const reportData = classData.students.map(student => ({
      'MSSV': student.studentId,
      'Họ và tên': student.name,
      'Email': student.email,
      'Tỷ lệ điểm danh': `${student.attendanceRate}%`,
      'Số buổi có mặt': student.presentCount,
      'Số buổi vắng': student.absentCount,
      'Số buổi muộn': student.lateCount,
      'Ghi chú': student.notes || ''
    }))
    
    if (format === 'pdf') {
      return this.exportToPDF(reportData, filename, {
        title: `Báo cáo điểm danh - ${classData.className}`,
        author: classData.teacherName,
        orientation: 'landscape',
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 }
        }
      })
    }
    
    return this.exportWithColumns(reportData, Object.keys(reportData[0]), format, filename)
  }
}

export default new ExportService()