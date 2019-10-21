import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { shell } from 'electron';
import path from 'path';
import { Card, Icon, Row, Col, Button, Modal, Tag, Dropdown, Menu } from 'antd';
import axios from 'axios';
import { useAsyncData } from '../../utils/hooks';
import { getProject } from '../../actions/project';
import routes from '../../constants/routes';
import NewProjectModal from './NewProjectModal';
import OpenProjectModal from './OpenProjectModal';
import NewScenarioModal from './NewScenarioModal';
import RenameScenarioModal from './RenameScenarioModal';
import './Project.css';

const Project = () => {
  const { isFetching, error, info } = useSelector(state => state.project);
  const activeScenario = useRef();
  const [isNewModalVisible, setNewModalVisible] = useState(false);
  const [isOpenModalVisible, setOpenModalVisible] = useState(false);
  const [isScenarioModalVisible, setScenarioModalVisible] = useState(false);
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);

  const dispatch = useDispatch();

  const reloadProject = () => {
    dispatch(getProject());
  };

  const showRenameModal = scenario => {
    activeScenario.current = scenario;
    setRenameModalVisible(true);
  };

  const { name, scenario, scenarios } = info;

  return (
    <div>
      <Card
        title={
          <React.Fragment>
            <h2>{error || name === '' ? 'No Project found' : name}</h2>
            <div className="cea-project-options">
              <Button
                icon="plus"
                size="small"
                onClick={() => setNewModalVisible(true)}
              >
                Create Project
              </Button>
              <Button
                icon="folder-open"
                size="small"
                onClick={() => setOpenModalVisible(true)}
              >
                Open Project
              </Button>
              <Button
                icon="sync"
                size="small"
                onClick={reloadProject}
                loading={isFetching}
              >
                Refresh
              </Button>
            </div>
          </React.Fragment>
        }
        bordered={false}
      >
        <Button
          type="primary"
          style={{
            display: 'block',
            width: '100%'
          }}
          onClick={() => setScenarioModalVisible(true)}
        >
          + Create New Scenario
        </Button>
        {!scenarios.length ? (
          <p style={{ textAlign: 'center', margin: 20 }}>No scenarios found</p>
        ) : scenario === '' ? (
          <p style={{ textAlign: 'center', margin: 20 }}>
            No scenario currently selected
          </p>
        ) : (
          <ScenarioCard
            scenario={scenario}
            projectPath={info.path}
            current={true}
            showRenameModal={showRenameModal}
          />
        )}
        {scenarios.map(_scenario =>
          _scenario !== scenario ? (
            <ScenarioCard
              key={`${name}-${_scenario}`}
              scenario={_scenario}
              projectPath={info.path}
              showRenameModal={showRenameModal}
            />
          ) : null
        )}
      </Card>
      <NewProjectModal
        visible={isNewModalVisible}
        setVisible={setNewModalVisible}
        project={info}
        onSuccess={reloadProject}
      />
      <OpenProjectModal
        visible={isOpenModalVisible}
        setVisible={setOpenModalVisible}
        project={info}
        onSuccess={reloadProject}
      />
      <NewScenarioModal
        visible={isScenarioModalVisible}
        setVisible={setScenarioModalVisible}
        project={info}
      />
      <RenameScenarioModal
        scenario={activeScenario.current}
        projectPath={info.path}
        visible={isRenameModalVisible}
        setVisible={setRenameModalVisible}
      />
    </div>
  );
};

const ScenarioCard = ({
  scenario,
  projectPath,
  showRenameModal,
  current = false
}) => {
  const [image, isLoading, error] = useAsyncData(
    `http://localhost:5050/api/project/scenario/${scenario}/image`,
    { image: null },
    [scenario]
  );
  const dispatch = useDispatch();

  const showConfirm = () => {
    let secondsToGo = 3;
    const modal = Modal.confirm({
      title: `Are you sure you want to delete this scenario?`,
      content: (
        <div>
          <p>
            <b>{scenario}</b>
          </p>
          <p>
            <i>(This operation cannot be reversed)</i>
          </p>
        </div>
      ),
      okText: `DELETE (${secondsToGo})`,
      okType: 'danger',
      okButtonProps: { disabled: true },
      cancelText: 'Cancel',
      onOk: () => deleteScenario(),
      centered: true
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
      modal.update({
        okText: `DELETE (${secondsToGo})`
      });
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      modal.update({
        okButtonProps: { disabled: false },
        okText: 'DELETE'
      });
    }, secondsToGo * 1000);
  };

  const deleteScenario = async () => {
    try {
      const resp = await axios.delete(
        `http://localhost:5050/api/project/scenario/${scenario}`
      );
      console.log(resp.data);
      dispatch(getProject());
    } catch (err) {
      console.log(err.response);
    }
  };

  const changeScenario = async () => {
    try {
      const resp = await axios.put(`http://localhost:5050/api/project/`, {
        scenario
      });
      console.log(resp.data);
      await dispatch(getProject());
      dispatch(push(routes.INPUT_EDITOR));
    } catch (err) {
      console.log(err.response);
    }
  };

  const openFolder = () => {
    shell.openItem(path.join(projectPath, scenario));
  };

  const editMenu = (
    <Menu>
      <Menu.Item key="rename" onClick={() => showRenameModal(scenario)}>
        Rename
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" onClick={showConfirm} style={{ color: 'red' }}>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      title={
        <React.Fragment>
          <span>{scenario} </span>
          {current ? <Tag>Current</Tag> : null}
        </React.Fragment>
      }
      extra={
        <React.Fragment>
          <span id={`${scenario}-edit-button`} className="scenario-edit-button">
            <Dropdown
              overlay={editMenu}
              trigger={['click']}
              getPopupContainer={() => {
                return document.getElementById(`${scenario}-edit-button`);
              }}
            >
              <Button>
                Edit <Icon type="down" />
              </Button>
            </Dropdown>
          </span>
          {current ? null : (
            <Button type="primary" onClick={changeScenario}>
              Open
            </Button>
          )}
        </React.Fragment>
      }
      style={{ marginTop: 16 }}
      type="inner"
    >
      <Row>
        <Col span={6}>
          <div
            style={{
              width: 256,
              height: 160,
              backgroundColor: '#eee',
              textAlign: 'center',
              textJustify: 'center'
            }}
          >
            {isLoading ? null : error ? (
              'Unable to generate image'
            ) : (
              <img
                className="cea-scenario-preview-image"
                src={`data:image/png;base64,${image.image}`}
                onClick={changeScenario}
              />
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default Project;
