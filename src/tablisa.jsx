import React, { useEffect, useState } from 'react';
import { read, utils } from 'xlsx';
import TablisaData from './tablisa.xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Card, Pagination, Modal, Dropdown, Button } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
import { BsInfoSquareFill } from 'react-icons/bs';

function ExcelTable() {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(null);
  const [filterOptions, setFilterOptions] = useState([]);

  const itemsPerPage = 50;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(TablisaData);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = utils.sheet_to_json(worksheet, { header: 1 });

        setData(excelData);
        setFilteredData(excelData);
        setTotalItems(excelData.length - 1);
      } catch (err) {
        setError('Ошибка при загрузке файла Excel');
      }
    };

    fetchData();
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFilterOptionClick = (value) => {
    const columnIndex = selectedFilterIndex;
    const filteredRows = rows.filter((row) => row[columnIndex] === value);
    const filteredData = [data[0], ...filteredRows];
    setFilteredData(filteredData);
    setTotalItems(filteredRows.length);
    setCurrentPage(1);
    setShowModal(false);
  };

  const handleFilter = (columnIndex) => {
    setSelectedFilterIndex(columnIndex);
    const options = Array.from(new Set(rows.map((row) => row[columnIndex])));
    setFilterOptions(options);
    setShowModal(true);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>Загрузка...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const cols = data[0].map((col) => ({ title: col }));
  const rows = data.slice(1);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();

    const filteredRows = rows.filter((row) =>
      row.some((cell) => cell.toString().toLowerCase().includes(searchValue))
    );

    const filteredData = [data[0], ...filteredRows];
    setFilteredData(filteredData);
    setTotalItems(filteredRows.length);
    setCurrentPage(1);
    setSearchValue(searchValue);
  };

  return (
    <div className="container">
      <div className="shadow p-3 mb-5 bg-body rounded">
        <Card>
          <Card.Header>
            <div className="card mb-2">
              <div className="card-body">
                <div className="search-container">
                  <FaUser size={25} className="Item" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={searchValue}
                    onChange={handleSearch}
                  />
                  <BsInfoSquareFill className="Item" size={27} />
                </div>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-wrapper">
              <table className="table table-striped">
                <thead className="thead-dark">
                  <tr>
                    {cols.map((col, index) => (
                      <th key={index}>
                        <div className="column-header">
                          <button
                            className="btn btn-primary btn-sm"
                            type="button"
                            onClick={() => handleFilter(index)}
                          >
                            <span>{col.title}</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
        <div className="pagination-info">
          <span>Найдено элементов: {totalItems}</span>
        </div>
        <Pagination>
          {Array.from({ length: totalPages }, (_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Выберите фильтр</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Фильтровать по: {cols[selectedFilterIndex]?.title}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {filterOptions.map((option, optionIndex) => (
                <Dropdown.Item
                  key={optionIndex}
                  onClick={() => handleFilterOptionClick(option)}
                >
                  {option}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ExcelTable;
