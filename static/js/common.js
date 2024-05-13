$(document).ready(function () {
    function getNamThi() {
        /**
         * Tạo select năm thi
         */
        this_year = new Date().getFullYear();
        i = 0
        while (i <= 5) {
            if (i == 0) {
                $("#select-nam-thi").append(`
                    <option value="${this_year}" selected>${this_year}</option>
                `);
            } else {
                this_year--;
                $("#select-nam-thi").append(`
                    <option value="${this_year}">${this_year}</option>
                `);
            }
            i++;
        }
    }
    getNamThi();

    function hideRows(search) {
        /**
         * Lọc dòng giá trị SBD. Nếu không khớp thì ẩn & ngược lại
         */
        let $rows = $('#data-diem-thi table tbody tr');
        $rows.each(function () {
            let row = $(this);
            let text = row.find('td:first').text();
            if (text.indexOf(search) === -1) {
                row.hide();
            } else {
                row.show();
            }
        });
    }

    function searchSBD() {
        let search = $("#searchBySBD").val();
        hideRows(search);
    }

    $("#searchBySBD").on("keyup", function () {
        searchSBD();
    });

    $("#searchBySBD-btn").on("click", function () {
        searchSBD();
    });

    function thongBao(message, status) {
        /**
         * Hiện thông báo
         * message: Nội dung
         * status: Trạng thái thực thi
         */
        Swal.fire({
            position: 'top-end',
            icon: status,
            title: message,
            showConfirmButton: false,
            timer: 2200,
            toast: true
        })
    }

    function readExcelFile(url) {
        /**
         * Đọc dữ liệu từ File Excel
         * @param url Đường dẫn đến file Excel
         */
        $.ajax({
            url: url,
            dataType: 'binary',
            xhrFields: {
                responseType: 'blob'
            },
            success: function (data) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let data = new Uint8Array(e.target.result);
                    let workbook = XLSX.read(data, { type: 'array' });
                    // Chỉ lấy dữ liệu từ Sheet0 (bỏ qua các sheet còn lại)
                    let sheetName = workbook.SheetNames[0];
                    let workSheet = workbook.Sheets[sheetName];
                    // Chuyển đổi dữ liệu từ worksheet sang JSON
                    let jsonDiemThi = XLSX.utils.sheet_to_json(workSheet);
                    // Tạo Table từ dữ liệu điểm thi
                    let tableHTML = khoiTaoTableDiemThi(jsonDiemThi);
                    // Render điểm thi lên DOM
                    $("#data-diem-thi").html(tableHTML);
                };
                reader.readAsArrayBuffer(data);
            },
            error: function (error) {
                thongBao("Không tìm thấy dữ liệu !", "warning");
            }
        });
    }

    function khoiTaoTableDiemThi(data) {
        /**
         * Khởi tạo tag table thể hiện điểm thi
         */
        let tableHTML = '<div style="height: 50vh;overflow-y: auto;"><table class="table table-striped">';
        tableHTML += '<thead><tr>';
        // Đọc & và gán header cho table
        for (let key in data[0]) {
            tableHTML += '<th>' + key + '</th>';
        }
        tableHTML += '</tr></thead><tbody>';
        // Đọc & và gán dữ liệu cho table
        data.forEach(function (row) {
            tableHTML += '<tr>';
            // Lặp lấy các điểm của một SBD và gán vào tag td
            for (let key in row) {
                tableHTML += '<td>' + row[key] + '</td>';
            }
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table></div>';
        return tableHTML;
    }

    $("#load-diem-thi").click(function () {
        /**
         * Load điểm thi lên màn hình
         */
        // Lấy giá trị select năm thi
        let nam_thi = $('#select-nam-thi').val();
        // Lấy giá trị select kỳ thi
        let ky_thi = $('#select-ky-thi').val();
        // Xóa dữ liệu table hiện tại
        $("#data-diem-thi table").remove();
        // Gọi hàm readExcelFile để load dữ liệu mới từ file excel
        readExcelFile(`/static/data/${ky_thi}_${nam_thi}.xlsx`);
    });



});
