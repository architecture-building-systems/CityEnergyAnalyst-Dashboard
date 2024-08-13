import { Button, Form, Input } from 'antd';
import { OpenDialogButton } from '../../Tools/Parameter';
import { PlusOutlined } from '@ant-design/icons';

const TypologyForm = ({ initialValues, onChange, onBack, onFinish }) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      initialValues={initialValues}
      onValuesChange={onChange}
      onFinish={onFinish}
      layout="vertical"
    >
      <Form.Item
        label="Building information (typology)"
        name="typology"
        extra={
          <div>
            <br />
            <div>
              Link to a path to building information in .xlsx/.csv/.dbf format.
            </div>
            <div>See an example here.</div>
            <br />
            <div>You can leave it empty and modify it later.</div>
          </div>
        }
      >
        <OpenDialogButton
          form={form}
          name="typology"
          type="file"
          filters={[{ name: 'DBF files', extensions: ['dbf'] }]}
          placeholder="Leave empty to auto-generate default"
        >
          <PlusOutlined />
          Browse for typology file
        </OpenDialogButton>
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ padding: '0 36px' }}
          >
            Next
          </Button>
          <Button style={{ padding: '0 36px' }} onClick={onBack}>
            Back
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default TypologyForm;
