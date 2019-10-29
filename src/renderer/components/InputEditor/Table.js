import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button } from 'antd';
import { setSelected, updateInputData } from '../../actions/inputEditor';
import routes from '../../constants/routes';
import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

const useTableData = tab => {
  const tables = useSelector(state => state.inputData.tables);
  const columns = useSelector(state => state.inputData.columns);

  const [data, setData] = useState({ data: [], columnDef: [] });

  const dispatch = useDispatch();

  const selectRow = (e, cell) => {
    const row = cell.getRow();
    const selectedRows = cell
      .getTable()
      .getSelectedData()
      .map(data => data.Name);
    if (cell.getRow().isSelected()) {
      dispatch(
        setSelected(selectedRows.filter(name => name !== row.getIndex()))
      );
    } else {
      dispatch(setSelected([...selectedRows, row.getIndex()]));
    }
  };

  const getData = () =>
    Object.keys(tables[tab]).map(row => ({
      Name: row,
      ...tables[tab][row]
    }));

  const getColumnDef = () =>
    Object.keys(columns[tab]).map(column => {
      let columnDef = { title: column, field: column };
      if (column === 'Name') {
        columnDef.frozen = true;
        columnDef.cellClick = selectRow;
      } else if (column !== 'REFERENCE') {
        columnDef.editor = 'input';
        columnDef.validator =
          columns[tab][column].type === 'str' ? 'string' : 'numeric';
        columnDef.minWidth = 150;
        // Hack to allow editing when double clicking
        columnDef.cellDblClick = () => {};
      }
      return columnDef;
    });

  useEffect(() => {
    setData({ data: getData(), columnDef: getColumnDef() });
  }, [tab]);

  return [data.data, data.columnDef];
};

const Table = ({ tab }) => {
  const [data, columnDef] = useTableData(tab);
  const selected = useSelector(state => state.inputData.selected);
  const dispatch = useDispatch();
  const tableRef = useRef(tab);
  const tabulator = useRef(null);
  const divRef = useRef(null);

  useEffect(() => {
    tabulator.current = new Tabulator(divRef.current, {
      data: data,
      index: 'Name',
      columns: columnDef,
      layout: 'fitDataFill',
      height: '300px',
      validationFailed: cell => {
        cell.cancelEdit();
      },
      cellEdited: data => {
        dispatch(
          updateInputData(
            tableRef.current,
            [data.getData()['Name']],
            [{ property: data.getField(), value: data.getValue() }]
          )
        );
      },
      placeholder: '<div>No matching records found.</div>'
    });
  }, []);

  // Keep reference of current table name
  useEffect(() => {
    tableRef.current = tab;
  }, [tab]);

  useEffect(() => {
    if (tabulator.current) {
      tabulator.current.setColumns(columnDef);
      tabulator.current.setData(data);
      tabulator.current.setSort('Name', 'asc');
      tabulator.current.deselectRow();
      tabulator.current.selectRow(selected);
    }
  }, [data, columnDef]);

  useEffect(() => {
    if (tabulator.current) {
      tabulator.current.deselectRow();
      tabulator.current.selectRow(selected);
      tabulator.current.getFilters().length &&
        tabulator.current.setFilter('Name', 'in', selected);
    }
  }, [selected]);

  return (
    <Card
      headStyle={{ backgroundColor: '#f1f1f1' }}
      size="small"
      extra={
        <TableButtons
          selected={selected}
          tabulator={tabulator}
          tableRef={tableRef}
        />
      }
    >
      <div ref={divRef} style={{ display: data.length ? 'block' : 'none' }} />
      {!data.length ? (
        <div>
          Input file could not be found. You can create the file using the
          <Link to={`${routes.TOOLS}/data-helper`}>{' data-helper '}</Link>tool.
        </div>
      ) : null}
    </Card>
  );
};

const TableButtons = ({ selected, tabulator }) => {
  const dispatch = useDispatch();
  const [filterToggle, setFilterToggle] = useState(false);

  const selectAll = () => {
    dispatch(setSelected(tabulator.current.getData().map(data => data.Name)));
  };

  const filterSelected = () => {
    if (filterToggle) {
      tabulator.current.clearFilter();
    } else {
      tabulator.current.setFilter('Name', 'in', selected);
    }
    setFilterToggle(oldValue => !oldValue);
  };

  const clearSelected = () => {
    dispatch(setSelected([]));
  };

  const deleteSelected = () => {};

  return (
    <div>
      <Button onClick={selectAll}>Select All</Button>
      <Button
        type={filterToggle ? 'primary' : 'default'}
        onClick={filterSelected}
      >
        Filter on Selection
      </Button>
      {selected.length ? (
        <React.Fragment>
          <Button>Edit Selection</Button>
          <Button onClick={clearSelected}>Clear Selection</Button>
          <Button type="danger" onClick={deleteSelected}>
            Delete Selection
          </Button>
        </React.Fragment>
      ) : null}
    </div>
  );
};

export default Table;
