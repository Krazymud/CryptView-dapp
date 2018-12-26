<template>
    <div class='banner'>
        <b-navbar class="s" toggleable>
            <b-navbar-brand>
                <img src="@/assets/logo.png" alt="CryptView">
            </b-navbar-brand>
            <b-navbar-nav>
                <b-nav-item class="nav" href='#'>Home</b-nav-item>
                <b-nav-item variant="link" class="nav" href='#'>About</b-nav-item>
                <b-button v-b-modal.modalPrevent variant="outline-light">&#x2795;</b-button>
                <b-modal id="modalPrevent"
                        ref="modal"
                        title="Sharing new views"
                        @ok.prevent="newView"
                        @shown="clearAll">
                    <b-form-group horizontal
                                    label="Nickname:"
                                    label-class="text-sm-right">
                        <b-form-input v-model="nickname" id="nestedStreet"></b-form-input>
                    </b-form-group>
                    <b-form-group horizontal
                                    label="Content:"
                                    label-class="text-sm-right">
                        <b-form-textarea    v-model="content"
                                            :rows="3"
                                            :max-rows="5">
                        </b-form-textarea>
                    </b-form-group>
                    <b-form-group horizontal
                                    label="Account:"
                                    label-class="text-sm-right">
                        <b-form-select :options="[web3.coinbase]">
                        </b-form-select>
                    </b-form-group>
                    <b-form-group horizontal
                                    label="Allow update:"
                                    label-class="text-sm-right"
                                    class="mb-0">
                        <b-form-radio-group class="pt-2" :options="options" v-model="allowUpdate">
                        </b-form-radio-group>
                    </b-form-group>
                    <b-alert :show="dismissCountdown"
                        dismissible
                        variant="warning"
                        @dismissed="dismissCountdown=0"
                        @dismiss-count-down="countdownChanged">
                        <p>{{errorMessage}}</p>
                        <b-progress variant="warning"
                                    :max="dismissSecs"
                                    :value="dismissCountdown"
                                    height="4px">
                        </b-progress>
                    </b-alert>
                </b-modal>
            </b-navbar-nav>
        </b-navbar>
    </div>
</template>

<script>
export default {
    name: 'cv-banner',
    data () {
        return {
            nickname: '',
            content: '',
            dismissSecs: 4,
            dismissCountdown: 0,
            errorMessage: '',
            allowUpdate: 'yes',
            options: [
                { text: 'Yes', value: 'yes' },
                { text: 'No', value: 'no' }
            ]
        }
    },
    computed: {
        web3 () {
            return this.$store.state.web3
        }
    },
    methods: {
        showAlert (msg) {
            this.dismissCountdown = this.dismissSecs
            this.errorMessage = msg
        },
        countdownChanged (newCountdown) {
            this.dismissCountdown = newCountdown
        },
        newView (event) {
            let update
            if (this.allowUpdate === 'yes') {
                update = true
            } else update = false
            if (this.nickname === '' || this.content === '') {
                this.showAlert('Please fill in all the blanks')
            } else {
                console.log(this.content, update, this.nickname, {from: this.web3.coinbase})
                this.$store.state.contractInstance().newIdea.sendTransaction(this.content, update, this.nickname, {from: this.web3.coinbase}, (error, result) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('New view!')
                    }
                })
                this.$refs.modal.hide()
            }
        },
        clearAll () {
            this.nickname = ''
            this.content = ''
        }
    }
}
</script>

<style scoped>

.banner {
    box-shadow: 0px 0px 5px rgba(51,51,51,0.5);
    background-color: #ffffff;
    margin-bottom: 20px;
}

.s {
    align-items: flex-end;
    position: relative;
    left: 25%;
}

</style>
