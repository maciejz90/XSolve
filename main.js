//Ustawienie, aby kod wykonywał się po kolei.
//Konkretnie, aby $.getJSON nie wykonywał się poza kolejnością
$.ajaxSetup({
   async: false
 });

//Wywołanie funkcji po załadowaniu dokumentu
$(document).ready(function() {
    getData();
    datePicker();
})

//Funkcja pobierająca plik data.json z serwera i wywołująca funkcję arrayToTable(data),
//która wypisuje zawartość data.json do tabeli
function getData(){
	$.getJSON("data.json", function(xsolve) {
        var data = xsolve.data;
        arrayToTable(data);
	});
}

function arrayToTable(data) {
    //Sprawdzenie, czy data z pliku data.js jest tablicą
    console.log('Czy data w data.js jest tablicą: ' + Array.isArray(data));
    //Utworzenie zmiennej tBody, odwołującej się do tbody w tabeli o ID employees
    var tBody = $('#employees tbody');
    //Utworzenie nowej tablicy o nazwie tColumns, zawierająca nagłówki tabeli #employees
    var tColumns = ["id", "firstName", "lastName", "dateOfBirth", "function", "experience"];
    //Iteracja po każdym obiekcie tablicy data i wywołanie na rzecz każdego elemenu funkcji
    $.each(data, function(index1, value1) {
        //Utworzenie zmiennej przechowującej zapis pustego wiersza
        var tr = $('<tr>');
        //Iteracja po każdym elemencie obiektu
        $.each(tColumns, function(index2, value2) {
            //Tworzenie dla tego elementu nowego pola td z odpowiednią wartościa (value1 - obiekt, value2 - element obiektu) i przypisanie każdego td do utworzonego wczesniej tr
            $('<td>').html(value1[value2]).appendTo(tr);
        });
        //Wstawienie przygotowanego wiersza do tabeli #employees i ponowne wykonanie calej funkcji aż do wypisania wszystkich danych
        tBody.append(tr);
    });
    /*Wywołanie funkcji paginate, która oczywiście dzieli tabelę na strony, ale niestety nie do końca
    współpracuje z funkcjami sortowania i filtrowania. Proponuję zakomentować :)*/
    paginate();
}

function filterTable(column,dataId) {
    //Deklaracja zmiennych
    var td, i;
    //Odwołanie do konkretnego inputu
    var input = $('#myInput'+dataId);
    //Pobranie wartości z inputu i transformacja na wielkie litery
    var filter = input.val().toUpperCase();
    //Odwołanie do wierszy tabeli
    var tr = $('#employees tr');
    //Iteracja po wszystkich wierszach tabeli
    for (i = 0; i < tr.length; i++) {
        //Dla każdego wiersza pobranie komórki w odpowiedniej kolumnie
        td = tr[i].getElementsByTagName("td")[column];
        //Wywołanie funkcji if dla każdej komórki w kolumnie
        if (td) {
            //Jeżeli ciąg znaków w inpucie znajduje się w danej komórce to pozostaw styl wyświetlania bez zmian
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
               tr[i].style.display = "";
                //W przeciwnym razie ukryj wiersz
            } else {
               tr[i].style.display = "none";
            }
        }
    }
}

function datePicker() {
    //Ustawienie opcji datepicker'a
    $('#datepicker').datepicker({
        dateFormat:'d.mm.yy',
        //Ustawienie zakresu lat do 100 lat wstecz
        yearRange: '-100:+0',
        //Ustawienie możliwości zmiany roku przez listę rozwijaną
        changeYear: true,
        //Wywołanie funkcji po wybraniu daty przez datepicker
        onSelect: function(dateText, inst) {
            //Utworzenie zmiennej pickedDate, którą rozdzielamy na tablicę stringów funkcja split()
            var pickedDate = dateText.split('.');
            //Nadpisanie zmiennej pickedDate obiektem klasy Date
                pickedDate = new Date(pickedDate[2], pickedDate[1], pickedDate[0]);
            //Utworzenie zmiennej odwołującą się do wierszy tbody
            var tr = $('#employees tbody tr');
            //Petla for each wywołana dla każdego rzędu
            tr.each(function(index, value) {
                //Utworzenie zmiennej przechowującej wewnętrzny html komórek z datą urodzin pracowników
                var birthDate = $(this).find("td").eq(3).html();
                //Rozdzielenie birthDate na datę i czas
                var birthDateNew = birthDate.split(" ");
                var data1 = birthDateNew[0].split('.');
                var data2 = birthDateNew[1].split(':');
                //Nadpisanie zmiennej birthDate obiektem klasy Date
                    birthDate = new Date(data1[2], data1[1], data1[0], data2[1], data2[0]);
                //Porównanie birthDate i pickedDate
                //W zalezności od wyniku pozostawienie lub ukrycie wiersza, na rzecz którego wykonana została funkcja
                if(birthDate >= pickedDate) {
                    tr[index].style.display = "";
                } else {
                    tr[index].style.display = "none";
                }
            });
        }
    });
}

function paginate() {
    $('#employees').each(function() {
        var currentPage = 0;
        var numPerPage = 5;
        var $table = $(this);
        $table.on('repaginate', function() {
            $table.find('tbody tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
        });
        
        $table.trigger('repaginate');
        var numRows = $table.find('tbody tr').length;
        var numPages = Math.ceil(numRows / numPerPage);
        var $pager = $('<div class="pager"></div>');
        for (var page = 0; page < numPages; page++) {
            $('<span class="page-number"></span>').text(page + 1).bind('click', {
                newPage: page
            }, function(event) {
                currentPage = event.data['newPage'];
                $table.trigger('repaginate');
                $(this).addClass('active').siblings().removeClass('active');
            }).appendTo($pager).addClass('clickable');
        }
        $pager.insertAfter($table).find('span.page-number:first').addClass('active');
    });
}



function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    //Pobranie kodu html tabeli (brak użycia [0] spowoduje utworzenie obiektu przechowującego tabelę)
    table = $('#employees')[0];
    switching = true;
    //Ustawienie kierunku sortowania na rosnący
    dir = "asc";
    //Utworzenie pętli, która będzie się wykonywać, aż sortowanie nie zostanie wykonane
    while (switching) {
    //Deklarujemy, że żadne sortowanie nie zostało wykonane
        switching = false;
        rows = $('tbody tr');
        //Utworzenie pętli po wszystkich rzędach
        for (i = 0; i < rows.length-1; i++) {
            //Ustawienie zmiennej o konieczności zamiany miejsc rzędami na false
            shouldSwitch = false;
            
            //Pobierz elementy do porównania - czyli pierwszy z kolei i następny po nim
            x = rows.eq(i).find("td").eq(n).html();
            y = rows.eq(i+1).find("td").eq(n).html();

            //Sprawdzenie, czy rzedy powinny zamienić się miejscami na podstawie kierunku dir
            if (dir == "asc") {
                if (x.toLowerCase() < y.toLowerCase()) {
                //Jeżeli tak, ustaw konieczność zmiany miejsc na true i przerwij pętlę
                    shouldSwitch= true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.toLowerCase() > y.toLowerCase()) {
                    shouldSwitch= true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            //Jeżeli zaistniała konieczność zmiany wierszy miejscami to wykonaj to i zapisz, że sortowanie zostało wykonane
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Zwiększ za każdym razem, gdy kolejność wierszy została zmieniona
            switchcount ++;
            } else {
            //Jeżeli żadne zmiany nie zostały wykonane i kierunek jest ustawiony na rosnący (asc) to ustaw kierunek na malejący wykonaj pętle while jeszcze raz
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function sortTable2(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = $('#employees')[0];
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = $('tbody tr');
        for (i = 0; i < rows.length-1; i++) {
            shouldSwitch = false;

            x = rows.eq(i).find("td").eq(n).html();
            y = rows.eq(i+1).find("td").eq(n).html();

            if (dir == "asc") {
                if (x.toLowerCase()-y.toLowerCase() > 0) {
                    shouldSwitch= true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.toLowerCase()-y.toLowerCase() < 0) {
                    shouldSwitch= true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
            } else {
            
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}