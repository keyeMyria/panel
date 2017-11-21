import {extendObservable, action} from 'mobx';
import map from 'lodash/map';

class AppStore {
  constructor() {
    extendObservable(this, {
      title: 'CodeAmp Panel',
      user: null,
      leftNavItems: [],
      leftNavProjectTitle: '',
      bookmarks: [],
      ws: {
        channel: null,
        data: null,
      },
      snackbar: {
        created: null,
        msg: null,
      },
      url: '',
      connectionHeader: {
          msg: "",
      },
      currentEnvironment: {
		    id: '',
	    },
    });
  }

  setTitle = action(title => {
    this.title = title;
  });

  setNavProjects = action(projects => {
    this.bookmarks = []
    map(projects, (project)=>{
      this.bookmarks.push({
        key: project.id,
        name: project.name,
        slug: "/projects/"+project.slug,
      })
    });
  });

  setUrl = action(url => {
      console.log('setUrl', url)
      this.url = url
  })

  setProjectTitle = action(title => {
    this.leftNavProjectTitle = title;
  })

  setSnackbar = action(params => {
    this.snackbar.created = new Date();
    this.snackbar.msg = params.msg;
  })

  setUser = action(user => {
    let { localStorage } = window
    this.user = user
    localStorage.setItem('user', user);
  });

  setConnectionHeader = action(params => {
    this.connectionHeader.msg = params.msg;
  });

  setCurrentEnv = action(params => {
	this.currentEnvironment.id = params.id
  })
}

export default AppStore;
