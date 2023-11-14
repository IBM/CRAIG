
##############################################################################
# IBM Cloud Provider
##############################################################################

provider "ibm" {
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_wdc07"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "wdc07"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_tor01"
  ibmcloud_api_key = var.ibmcloud_api_key
  zone             = "tor01"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_sao01"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "sao01"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_tok04"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "tok04"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_dal12"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "dal12"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_dal10"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "dal10"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_us_south"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "us-south"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_wdc06"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "wdc06"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_us_east"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "us-east"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_lon06"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "lon06"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_lon04"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "lon04"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_eu_de_2"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "eu-de-2"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_eu_de_1"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "eu-de-1"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_syd05"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "syd05"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_syd04"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "syd04"
  ibmcloud_timeout = 60
}

##############################################################################

##############################################################################
# Resource Groups
##############################################################################

resource "ibm_resource_group" "craig_rg" {
  name = "craig-rg"
  tags = [
    "craig",
    "development"
  ]
}

##############################################################################


##############################################################################
# Power VS Workspace Craig Wdc 07
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_wdc07" {
  provider          = ibm.power_vs_wdc07
  name              = "craig-power-workspace-craig-wdc07"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "wdc07"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Tor 01
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_tor01" {
  provider          = ibm.power_vs_tor01
  name              = "craig-power-workspace-craig-tor01"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "tor01"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Sao 01
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_sao01" {
  provider          = ibm.power_vs_sao01
  name              = "craig-power-workspace-craig-sao01"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "sao01"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Tok 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_tok04" {
  provider          = ibm.power_vs_tok04
  name              = "craig-power-workspace-craig-tok04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "tok04"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Dal 12
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_dal12" {
  provider          = ibm.power_vs_dal12
  name              = "craig-power-workspace-craig-dal12"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal12"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Dal 10
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_dal10" {
  provider          = ibm.power_vs_dal10
  name              = "craig-power-workspace-craig-dal10"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal10"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Us South
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_us_south" {
  provider          = ibm.power_vs_us_south
  name              = "craig-power-workspace-craig-us-south"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "us-south"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Wdc 06
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_wdc06" {
  provider          = ibm.power_vs_wdc06
  name              = "craig-power-workspace-craig-wdc06"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "wdc06"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Us East
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_us_east" {
  provider          = ibm.power_vs_us_east
  name              = "craig-power-workspace-craig-us-east"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "us-east"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Lon 06
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_lon06" {
  provider          = ibm.power_vs_lon06
  name              = "craig-power-workspace-craig-lon06"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "lon06"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Lon 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_lon04" {
  provider          = ibm.power_vs_lon04
  name              = "craig-power-workspace-craig-lon04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "lon04"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Eu De 2
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_eu_de_2" {
  provider          = ibm.power_vs_eu_de_2
  name              = "craig-power-workspace-craig-eu-de-2"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "eu-de-2"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Eu De 1
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_eu_de_1" {
  provider          = ibm.power_vs_eu_de_1
  name              = "craig-power-workspace-craig-eu-de-1"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "eu-de-1"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Syd 05
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_syd05" {
  provider          = ibm.power_vs_syd05
  name              = "craig-power-workspace-craig-syd05"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "syd05"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Syd 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_syd04" {
  provider          = ibm.power_vs_syd04
  name              = "craig-power-workspace-craig-syd04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "syd04"
  resource_group_id = ibm_resource_group.craig_rg.id
  tags = [
    "hello",
    "world"
  ]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################