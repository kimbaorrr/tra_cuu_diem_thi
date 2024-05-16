$(document).ready(function () {
    let table = undefined;
    function getNamThi() {
        /**
         * Tạo select năm thi
         */
        let this_year = new Date().getFullYear();
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


    $("#kieu-loc-menu li a").on("click", function () {
        /**
         * Chọn kiểu lọc & gán nội dung cho button
         */
        let chon_kieu = $(this).text();
        $("#kieu-loc-btn").text(chon_kieu);
    });


    function searchQuery(value) {
        /**
         * Bắt đầu tìm kiếm
         */
        table.search(value).draw();
    }

    $("#tim-kiem-input").on("keyup", function () {
        /**
         * Bắt đầu tìm khi nhấn phím để nhập nội dung
         */
        searchQuery($(this).val());
    });

    $("#tim-kiem-btn").on("click", function () {
        /**
         * Bắt đầu tìm nội dung khi ấn nút
         */
        if ($("#tim-kiem-input").val() != "") {
            searchQuery($("#tim-kiem-input").val());
        }
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
            timer: 2000,
            toast: true
        })
    }

    function xoaDataTableOld() {
        let data_diem_thi = $("#data-diem-thi");
        if ($.fn.DataTable.isDataTable(data_diem_thi)) {
            data_diem_thi.DataTable().clear().destroy();
            data_diem_thi.empty();
        }
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
                    // Chuyển data từ reader về dạng mảng uint8 & đọc chúng
                    let data = new Uint8Array(e.target.result);
                    let workbook = XLSX.read(data, { type: 'array' });
                    // Chỉ lấy dữ liệu từ Sheet0 (bỏ qua các sheet còn lại)
                    let sheetName = workbook.SheetNames[0];
                    let workSheet = workbook.Sheets[sheetName];
                    // Chuyển đổi dữ liệu từ worksheet sang JSON
                    let jsonDiemThi = XLSX.utils.sheet_to_json(workSheet);
                    // Khởi tạo DataTables với dữ liệu từ JSON
                    table = $('#data-diem-thi').DataTable({
                        "columnDefs": [{
                            "targets": [0], // Chỉ Search cột SBD
                            "searchable": true
                        }],
                        scrollX: '100%',
                        scrollY: '35vh', // Đặt chiều cao của vùng cuộn
                        scrollCollapse: true, // Bật thanh cuộn
                        data: jsonDiemThi, // Nạp data json điểm thi
                        columns: Object.keys(jsonDiemThi[0]).map(key => ({
                            title: key,
                            data: key
                        })) // Lấy thông tin headers
                    });
                };
                reader.readAsArrayBuffer(data);
                hideLoadingSpin();
            },
            error: function (error) {
                thongBao("Không tìm thấy dữ liệu !", "warning");
                hideLoadingSpin();
            }
        });
    }

    function showLoadingSpin() {
        /**
         * Hiện loading circle
         */
        $("#loading-spin").show().delay(1000);
    }

    function hideLoadingSpin() {
        /**
         * Ẩn loading circle
         */
        $("#loading-spin").hide();
    }

    $("#load-diem-thi").click(function () {
        /**
         * Load điểm thi lên màn hình
         */
        // Hiện loading circle
        showLoadingSpin();
        let this_btn = $(this);
        // Tắt nút Nạp dữ liệu khi đã nhấn (Ngăn nhấn nhiều lần)
        this_btn.prop('disabled', true);
        // Lấy giá trị select năm thi
        let nam_thi = $('#select-nam-thi').val();
        // Lấy giá trị select kỳ thi
        let ky_thi = $('#select-ky-thi').val();
        // Xóa Table cũ
        xoaDataTableOld();
        // Gọi hàm readExcelFile để load dữ liệu mới từ file excel
        readExcelFile(`/static/data/${ky_thi}_${nam_thi}.xlsx`);
        // Bật lại nút Nạp dữ liệu sau 1 giâys
        setTimeout(function () {
            this_btn.prop('disabled', false);
        }, 1200);

    });
});
