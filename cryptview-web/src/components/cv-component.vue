<template>
    <div class="cv-container">
        <b-modal id="myModal"
                ref="myModalRef"
                title="Replying"
                @ok.prevent="newReply"
                @shown="clearAll">
            <b-form-group horizontal
                    label="Nickname:"
                    label-class="text-sm-right">
                <b-form-input v-model="nickname"></b-form-input>
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
        <div v-for="(view, index) in viewList" :key="index" class="card">
            <b-card :title="view.author">
                <p class="card-text">
                    {{ view.content }}
                </p>
                <b-button v-on:click="currIndex = index" v-b-modal.myModal variant="link">reply</b-button>
                <b-button variant="link">like</b-button>
                <b-button variant="link">reward</b-button>
                <div v-for="(reply, index) in view.replyList" v-bind:key="index" class="reply">
                    <hr />
                    <b-card  :title="reply.author">
                        <p class="card-text">
                            {{ reply.content }}
                        </p>
                        <b-link href="#" class="card-link">like</b-link>
                        <b-link href="#" class="card-link">reward</b-link>
                    </b-card>
                </div>
            </b-card>
        </div>
    </div>
</template>

<script>
// import Vue from 'vue'
export default {
    name: 'cryptview',
    data: function () {
        return {
            nickname: '',
            content: '',
            currIndex: -1,
            dismissSecs: 4,
            dismissCountdown: 0,
            errorMessage: '',
            allowUpdate: 'yes',
            options: [
                { text: 'Yes', value: 'yes' },
                { text: 'No', value: 'no' }
            ],
            viewList: [],
            tempList: [],
            count: 0
        }
    },
    computed: {
        web3 () {
            return this.$store.state.web3
        }
    },
    mounted () {
        this.updateViews()
        setInterval(this.updateViews, 10000)
    },
    methods: {
        newReply () {
            let update
            if (this.allowUpdate === 'yes') {
                update = true
            } else update = false
            if (this.nickname === '' || this.content === '') {
                this.showAlert('Please fill in all the blanks')
            } else {
                console.log('reply to' + this.currIndex)
                this.$store.state.contractInstance().reply.sendTransaction(this.currIndex, this.content, update, this.nickname, {from: this.web3.coinbase}, (error, result) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('New reply!')
                    }
                })
                this.$refs.myModalRef.hide()
            }
        },
        clearAll () {
            this.nickname = ''
            this.content = ''
        },
        showAlert (msg) {
            this.dismissCountdown = this.dismissSecs
            this.errorMessage = msg
        },
        countdownChanged (newCountdown) {
            this.dismissCountdown = newCountdown
        },
        updateViews () {
            if (this.$store.state.contractInstance !== null && typeof this.$store.state.contractInstance !== 'undefined') {
                this.$store.state.contractInstance().count.call(function (error, result) {
                    if (error) {
                        console.log(error)
                    } else {
                        let cnt = result.c[0]
                        this.count = cnt
                        console.log('updating...')
                        this.tempList = []
                        this.readViews(cnt - 1, 0, cnt)
                    }
                }.bind(this))
            }
        },
        readViews (shareId, replyId, length) {
            if (length > 0) {
                console.log('readingShare', shareId, replyId)
                console.log('shit')
                this.$store.state.contractInstance().ideas.call(shareId, replyId, function (error, result) {
                    if (error) {
                        console.log('error')
                        if (length > 1) {
                            this.readViews(shareId - 1, 0, length - 1)
                        } else {
                            console.log('hey')
                            this.viewList = this.tempList
                        }
                    } else {
                        var view = result
                        this.$store.state.contractInstance().getLikes.call(shareId, replyId, function (error, result) {
                            if (error) {
                                console.log(error)
                            } else {
                                // var like = result.c[0]
                                this.$store.state.contractInstance().getAllRewards.call(shareId, replyId, function (error, result) {
                                    if (error) {
                                        console.log(error)
                                    } else {
                                        // var reward = this.$store.state.web3.web3Instance().fromWei(result, 'ether').toString()
                                        if (replyId === 0) {
                                            var newView = {
                                                author: view[2],
                                                content: view[1],
                                                replyList: []
                                            }
                                            this.tempList.push(newView)
                                        } else {
                                            var newReply = {
                                                author: view[2],
                                                content: view[1]
                                            }
                                            this.tempList[shareId].replyList.push(newReply)
                                            // Vue.set(this.viewList[this.count - 1 - shareId].replyList, replyId, newReply)
                                        }
                                        this.readViews(shareId, replyId + 1, length)
                                    }
                                }.bind(this))
                            }
                        }.bind(this))
                    }
                }.bind(this))
            } else {
                console.log('hey')
                this.viewList = this.tempList
            }
        }
    }
}
</script>

<style scoped>
    .card {
        width: 800px;
        margin: 0 auto;
    }
    .reply .card {
        width: 750px !important;
    }
</style>
