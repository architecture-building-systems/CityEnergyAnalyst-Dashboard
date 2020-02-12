import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Radio, Input, Select } from 'antd';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { useOpenScenario, useFetchProject, useChangeRoute } from './Project';
import CreatingScenarioModal from './CreatingScenarioModal';
import ScenarioGenerateDataForm from './ScenarioGenerateDataForm';
import ScenarioCopyDataForm from './ScenarioCopyDataForm';
import ScenarioImportDataForm from './ScenarioImportDataForm';
import Parameter from '../Tools/Parameter';
import { withErrorBoundary } from '../../utils/ErrorBoundary';
import routes from '../../constants/routes';

const NewScenarioModal = ({ visible, setVisible, project }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef();
  const openScenario = useOpenScenario();
  const fetchProject = useFetchProject();
  const goToDBEditor = useChangeRoute(routes.DATABASE_EDITOR);
  const databaseParameter = useFetchDatabasePathParameter();

  const createScenario = e => {
    setError(null);
    formRef.current.validateFieldsAndScroll(
      { scroll: { offsetTop: 60 } },
      async (err, values) => {
        if (!err) {
          setConfirmLoading(true);
          setModalVisible(true);
          console.log('Received values of form: ', values);
          try {
            const resp = await axios.post(
              'http://localhost:5050/api/project/scenario/',
              values
            );
            console.log(resp.data);
            if (values['databases-path'] !== 'create') {
              openScenario(values.name);
            } else {
              await fetchProject();
              goToDBEditor();
            }
          } catch (err) {
            console.log(err.response);
            setError(err.response);
          } finally {
            setConfirmLoading(false);
          }
        }
      }
    );
  };

  const handleCancel = e => {
    setVisible(false);
  };

  return (
    <Modal
      title="Create new Scenario"
      visible={visible}
      width={800}
      onOk={createScenario}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Create"
      maskClosable={false}
      destroyOnClose
    >
      <NewScenarioForm
        ref={formRef}
        project={project}
        databaseParameter={databaseParameter}
      />
      <CreatingScenarioModal
        visible={modalVisible}
        setVisible={setModalVisible}
        error={error}
        createScenario={createScenario}
      />
    </Modal>
  );
};

const NewScenarioForm = Form.create()(
  ({ form, project, databaseParameter }) => {
    const choice = form.getFieldValue('input-data');

    return (
      <Form>
        <Form.Item label={<h2 style={{ display: 'inline' }}>Scenario Name</h2>}>
          {form.getFieldDecorator('name', {
            initialValue: '',
            rules: [
              { required: true },
              {
                validator: (rule, value, callback) => {
                  if (
                    value.length != 0 &&
                    fs.existsSync(path.join(project.path, value))
                  ) {
                    callback('Scenario with name already exists in project');
                  } else {
                    callback();
                  }
                }
              }
            ]
          })(<Input placeholder="Name of new Scenario" />)}
        </Form.Item>

        <h2>Database</h2>
        {databaseParameter !== null && (
          <Parameter form={form} parameter={databaseParameter} />
        )}

        <h2>Input Data</h2>
        <Form.Item>
          {form.getFieldDecorator('input-data', {
            initialValue: 'generate'
          })(
            <Radio.Group>
              <Radio value="generate" style={{ display: 'block' }}>
                Generate new input files using tools
              </Radio>
              {project.scenarios.length ? (
                <Radio value="copy" style={{ display: 'block' }}>
                  Copy input folder from another scenario in the project
                </Radio>
              ) : null}
              <Radio value="import" style={{ display: 'block' }}>
                Import input files
              </Radio>
            </Radio.Group>
          )}
        </Form.Item>

        <ScenarioGenerateDataForm form={form} visible={choice === 'generate'} />
        <ScenarioCopyDataForm
          form={form}
          visible={choice === 'copy'}
          project={project}
        />
        <ScenarioImportDataForm form={form} visible={choice === 'import'} />
      </Form>
    );
  }
);

const useFetchDatabasePathParameter = () => {
  const [parameter, setParameter] = useState(null);
  useEffect(() => {
    const fetchParameter = async () => {
      try {
        const resp = await axios.get(
          'http://localhost:5050/api/tools/data-initializer'
        );
        const dbPathParam =
          resp.data.parameters[
            resp.data.parameters.findIndex(
              p => p.type === 'DatabasePathParameter'
            )
          ];
        dbPathParam.choices['Create your own database later'] = 'create';
        setParameter(dbPathParam);
      } catch (err) {
        console.log(err);
      }
    };
    fetchParameter();
  }, []);
  return parameter;
};

export default withErrorBoundary(NewScenarioModal);
