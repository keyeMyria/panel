import React from 'react';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Table, { TableCell, TableHead, TableBody, TableRow } from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import Input from 'material-ui/Input';
import InputField from 'components/Form/input-field';
import SelectField from 'components/Form/select-field';
import validatorjs from 'validatorjs';
import { observer, inject } from 'mobx-react';
import MobxReactForm from 'mobx-react-form';
import styles from './style.module.css';
import { graphql, compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';


@graphql(gql`
query Project($slug: String, $environmentId: String){
  project(slug: $slug, environmentId: $environmentId) {
    id
    services {
      id
      name
      command
      serviceSpec {
        id
        name
      }
      count
      type
      containerPorts {
        id
        port
        protocol
      }
      created
    }
  }

}`,{
  options: (props) => ({
    variables: {
      slug: props.match.params.slug,
      environmentId: props.store.app.currentEnvironment.id,
    }
  })
})
@inject("store") @observer
export default class LoadBalancer extends React.Component {
    
  constructor(props){
    super(props)
    this.state = {}
  }

  componentWillMount(){
    this.setupForm()
  }

  setupForm(){
    var self = this
    const fields = [
        'service',
        'subdomain',
        'access',
        'portMaps',
        'portMaps[].port',
        'portMaps[].containerPort',
        'portMaps[].serviceProtocol',
    ]
    const rules = {}
    const labels = {
        'service': 'SERVICE',
        'subdomain': 'SUBDOMAIN',
        'access': 'ACCESS',
        'portMaps': 'PORT MAPS',
        'portMaps[].port': 'PORT',
        'portMaps[].containerPort': 'CONTAINER PORT',
        'portMaps[].serviceProtocol': 'SERVICE PROTOCOL',
    }
    const initials = {}
    const types = {}
    const extra = {
        'access': [{
            'key': 'internal',
            'value': 'Internal'
        }, {
            'key': 'external',
            'value': 'External'
        }, {
            'key': 'office',
            'value': 'Office'
        }],
        'portMaps[].serviceProtocol': [{
            'key': 'http',
            'value': 'HTTP'
        }, {
            'key': 'https',
            'value': 'HTTPS'
        }, {
            'key': 'ssl',
            'value': 'SSL'
        }, {
            'key': 'tcp',
            'value': 'TCP'
        }, {
            'key': 'udp',
            'value': 'UDP'
        }]
    }

    const $hooks = {
      onChange(instance){
        self.form.update({ portMaps: [] })
      }
    };    

    const hooks = {
        'service': $hooks,
    };

    const plugins = { dvr: validatorjs }
    this.form = new MobxReactForm({ fields, rules, labels, initials, types, extra, hooks }, {plugins })
  }

  onError(form){
    // todo
  }
  
  onSuccess(form){
    // convert obj -> { "config": [kv] }
    var self = this
    var userConfig = {
      "config": [],
      "form": this.form.values(),
    }
    if(this.props.config.fields.size > 0){
      Object.keys(this.props.config.values()).map(function(key){
        userConfig.config.push({ "key": key, "value": self.props.config.values()[key] })
      })
    }

    if(this.props.viewType === 'edit'){
        this.props.createExtension({
          variables: {
            'projectId': this.props.project.id,
            'extensionSpecId': this.props.extensionSpec.id,
            'config': userConfig,
            'environmentId': this.props.store.app.currentEnvironment.id,
          }
        }).then(({ data }) => {
          this.setState({ addButtonDisabled: false })
          this.props.refetch()
          this.props.onCancel()
        });
    }
  }

  onAdd(extension, event){
    this.setState({ addButtonDisabled: true })
    if(this.form){
      this.form.onSubmit(event, { onSuccess: this.onSuccess.bind(this), onError: this.onError.bind(this) })
    }
  }    

  render(){
    const { viewType, onCancel } = this.props;
    const { loading, project } = this.props.data;

    if(loading){
      return (<div>Loading...</div>)
    }
    
    var self = this
    const extraOptions = project.services.map(function(service){
        return {
          key: service.id,
          value: service.name,
        }
    })

    var containerPortOptions = []
    // get port options depending on selected service, if exists
    if(this.form.$('service').value){
      project.services.map(function(service){
        if(service.id === self.form.$('service').value){
          containerPortOptions = service.containerPorts.map(function(cPort){
            return {
              key: cPort.port,
              value: cPort.port
            }
          })
        }
      })
    }

    this.form.state.extra({
        service: extraOptions,
        containerPort: containerPortOptions,
    })

    let view = (<div></div>);
    
    if(viewType === "edit"){
      view = (
        <div>
            <form onSubmit={(e) => e.preventDefault()}>
                <Grid container spacing={24}>
                    <Grid item xs={6}>
                        <SelectField field={this.form.$('service')} extraKey={'service'} />
                    </Grid>
                    <Grid item xs={6}>
                        <InputField field={this.form.$('subdomain')} />
                    </Grid>        
                    <Grid item xs={12}>
                        <SelectField field={this.form.$('access')} />
                    </Grid>        
                </Grid>
                {/* port maps */}
                {this.form.values()['service'] !== "" &&
                  <div>
                    {this.form.$('portMaps').map(function(portMap){
                        return (
                            <Grid container spacing={24}>
                                <Grid item xs={3}>
                                  <InputField field={portMap.$('port')} />
                                </Grid>
                                <Grid item xs={4}>
                                  <SelectField field={portMap.$('containerPort')} extraKey={'containerPort'} />
                                </Grid>        
                                <Grid item xs={4}>
                                  <SelectField field={portMap.$('serviceProtocol')} />
                                </Grid>      
                                <Grid item xs={1}>
                                  <IconButton>
                                    <CloseIcon onClick={portMap.onDel} />
                                  </IconButton>
                                </Grid>                                                                                          
                            </Grid>                            
                        )
                    })}
                    <Grid item xs={12}>
                        <Button raised type="secondary" onClick={this.form.$('portMaps').onAdd}>
                            Add Port Map
                        </Button>
                    </Grid>        
                    <br/>  
                  </div>      
                }
            </form>
            <Grid item xs={12}>
                <Button raised color="primary" className={styles.rightPad}
                    onClick={this.onAdd.bind(this)}
                    disabled={this.state.addButtonDisabled}
                >
                    Save
                </Button>
                <Button color="primary"
                    className={styles.paddingLeft}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </Grid>          
        </div>
      )
    }
    return view
  }

}