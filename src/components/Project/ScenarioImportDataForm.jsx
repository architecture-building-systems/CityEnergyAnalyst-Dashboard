import {
  DownOutlined,
  EllipsisOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Dropdown, Menu } from 'antd';

const ScenarioImportDataForm = ({ form, visible }) => {
  const inputFiles = {
    zone: {
      extension: ['.shp'],
      placeholder: 'Path to geometry of the zone',
      help: '',
    },
    surroundings: {
      extension: ['.shp'],
      placeholder: 'Path to geometry of surroundings',
      help: '',
    },
    streets: {
      extension: ['.shp'],
      placeholder: 'Path to street geometry',
      help: '',
    },
    terrain: {
      extension: ['.tif'],
      placeholder: 'Path to the digital elevation model',
      help: '',
    },
    typology: {
      extension: ['.dbf'],
      placeholder: 'Path to typology database',
      help: 'Leave empty for CEA to create one for you',
    },
  };
  form.getFieldDecorator('fields', {
    initialValue: ['zone', 'typology'],
  });
  const fields = form.getFieldValue('fields');
  const fileChoices = Object.keys(inputFiles).filter(
    (fileType) => !fields.includes(fileType)
  );

  const addField = (value) => {
    const newFields = fields.concat(value);
    form.setFieldsValue({
      fields: newFields,
    });
  };

  const removeField = (k) => {
    form.setFieldsValue({
      fields: fields.filter((key) => key !== k),
    });
  };

  const openDialog = async (id, file) => {
    const options = {
      properties: ['openFile'],
      filters: [
        {
          name: `${file} file`,
          extensions: inputFiles[file].extension.map((fileExtension) =>
            fileExtension.substr(1)
          ),
        },
      ],
    };
    const paths = await ipcRenderer.invoke('open-dialog', options);
    if (paths && paths.length) {
      form.setFieldsValue({ [id]: paths[0] });
    }
  };

  // Check if file is valid
  const vaildFile = (fileType, filePath) => {
    return true;
  };

  return (
    <div
      style={{
        display: visible ? 'block' : 'none',
      }}
    >
      <Dropdown
        overlay={
          <Menu>
            {fileChoices.map((choice) => (
              <Menu.Item key={choice} onClick={() => addField(choice)}>
                {choice}
              </Menu.Item>
            ))}
          </Menu>
        }
        trigger={['click']}
      >
        <Button>
          Select additional files that you want to import <DownOutlined />
        </Button>
      </Dropdown>

      {fields.map((key) => (
        <Form.Item key={key} label={key}>
          {form.getFieldDecorator(`files[${key}]`, {
            initialValue: '',
            rules: [
              { required: visible && key === 'zone' },
              visible
                ? {
                    validator: (rule, value, callback) => {
                      if (!fs.existsSync(value)) {
                        if (
                          ['zone', 'typology'].includes(key) &&
                          value === ''
                        ) {
                          callback();
                        } else callback('Path does not exist');
                      } else if (!vaildFile(key, value))
                        callback(`Select a vaild ${key} file`);
                      else callback();
                    },
                  }
                : {},
            ],
          })(
            <Input
              style={{ width: '60%', marginRight: 8 }}
              placeholder={inputFiles[key].placeholder}
              addonAfter={
                <button
                  type="button"
                  style={{ height: '30px', width: '50px' }}
                  onClick={() => openDialog(`files[${key}]`, key)}
                >
                  <EllipsisOutlined />
                </button>
              }
            />
          )}
          {['zone', 'typology'].includes(key) ? null : (
            <MinusCircleOutlined
              onClick={() => removeField(key)}
              style={{
                position: 'relative',
                top: 4,
                color: '#ff4d4f',
                fontSize: 24,
              }}
            />
          )}
          <small style={{ display: 'block', lineHeight: 'normal' }}>
            {inputFiles[key].help}
          </small>
        </Form.Item>
      ))}
    </div>
  );
};

export default ScenarioImportDataForm;