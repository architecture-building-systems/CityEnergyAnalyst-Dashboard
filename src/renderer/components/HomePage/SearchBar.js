import React, { useState, useEffect, useRef } from 'react';
import { shell } from 'electron';
import { Icon, Input } from 'antd';
import axios from 'axios';
import './SearchBar.css';

const DOCS_URL = 'https://city-energy-analyst.readthedocs.io/en/latest/';

const useGlossaryData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getSearchResults = async () => {
      try {
        const result = await axios.get('http://localhost:5050/api/glossary');
        setData(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    getSearchResults();
  }, []);

  return data;
};

const SearchBar = () => {
  const data = useGlossaryData();
  const [value, setValue] = useState('');
  const [output, setOutput] = useState('');
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef();

  const handleChange = event => {
    setValue(event.target.value);
  };

  const handleFocus = () => {
    setVisible(true);
  };

  const handleBlur = () => {
    setTimeout(() => setVisible(false), 100);
  };

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (!value.trim()) setOutput('');
    timeoutRef.current = setTimeout(() => {
      setOutput(value);
    }, 500);
  }, [value]);

  return (
    <div style={{ marginLeft: 50 }}>
      <Input
        placeholder="Glossary Search"
        suffix={<Icon type="search" />}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <div className="cea-search-dropdown">
        <SearchResults
          data={data}
          output={output}
          visible={visible}
          setValue={setValue}
        />
      </div>
    </div>
  );
};

const SearchResults = ({ data, output, visible, setValue }) => {
  if (!visible || output == '') return null;

  const results = data
    .map(category => {
      const variables = category.variables.filter(
        variable =>
          variable.VARIABLE.toLowerCase().indexOf(output.toLowerCase()) !== -1
      );
      return variables.length ? (
        <SearchCategory key={category.script} category={category}>
          {variables.map(variable => (
            <SearchItem
              key={`${category.script}-${variable.FILE_NAME}-${variable.VARIABLE}`}
              category={category.script}
              item={variable}
              setValue={setValue}
            />
          ))}
        </SearchCategory>
      ) : null;
    })
    .filter(category => !!category);

  return results.length ? (
    results
  ) : (
    <div className="cea-search-item empty">
      No results found for
      <b>
        <i>{` ${output}`}</i>
      </b>
    </div>
  );
};

const SearchCategory = ({ category, children }) => {
  return (
    <div key={category.script} className="cea-search-category">
      <div className="cea-search-category-title">
        <b>
          <i>{category.script}</i>
        </b>
      </div>
      {children}
    </div>
  );
};

const SearchItem = ({ category, item, setValue }) => {
  const openUrl = () => {
    const type = category === 'input' ? 'input' : 'output';
    shell.openExternal(
      `${DOCS_URL}${type}_methods.html?highlight=${
        item.VARIABLE
      }#${item.LOCATOR_METHOD.split('_').join('-')}`
    );
    setValue(item.VARIABLE);
  };

  return (
    <div className="cea-search-item" onClick={openUrl}>
      <div>
        <b>{item.VARIABLE}</b>
        <small> - {item.UNIT}</small>
      </div>
      <div className="cea-search-description">{item.DESCRIPTION}</div>
      <small style={{ wordBreak: 'break-all' }}>{item.FILE_NAME}</small>
    </div>
  );
};

export default SearchBar;
