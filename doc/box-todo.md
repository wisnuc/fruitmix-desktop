# Todo list of box

### 目前的限制

1、本地文件上传，一次只能选择一个小于1G的文件
2、不能跨NAS传输文件
3、单次Tweet发送NAS文件或照片不能过多（上限约210个）
4、用户使用StationCloudToken，不能通过局域网访问没有local user的station上的media资源

以上问题中:

+ 问题1在`node/lib/box.js`中的`uploadHandle`方法中加了选择文件个数限制，`readAsync`方法中加了文件大小检查
+ 问题2和4需要server端解决，不修改api调用的话，client端不需要修改，前者涉及`common/fruimix.js`中的`nasTweet` api，后者涉及`node/lib/server.js`中的`downloadFile`方法
+ 问题3目前处理是，在发送请求时自动分割，作为多个tweet发送，一次最多105个文件


### Box更新逻辑

考虑到客户端本地持久化的问题，目前Box的更新是依赖于`云 - 本地数据库 - 渲染`交互的逻辑

+ 本地数据库中的`boxes`数据直接与云同步，保持与云一致，用户进入页面时会自动更新一次，之后依赖于MQTT更新
+ 本地数据库中的`tweets`数据，根据`boxes`自动增量更新，与云进行同步。
+ `渲染`的对象始终是本地数据库，如果本地数据库与云更新`boxes`成功，但更新`tweets`未成功时，不会更新`渲染`页面
+ 新消息数只计算他人的tweets数，作为一个属性存在`boxes`中，每次`本地数据库`从`云`更新添加新Tweets时更新，每次`渲染`时清零
+ 新建Tweets会作为草稿存在`drafts`数据库中，发送成功后依赖trueUUID匹配对应的真tweet进行自我清理，否则会当作发送失败

### Todo

+ Box本地持久化的数据库清理问题，因为目前只能随应用卸载时清空
+ 退群用户由于云无法粘信息而导致无法对相关Tweets进行用户解析的问题，目前用`退群用户`处理
+ 新建本地上传照片的Tweet从`Draft`状态到发送成功且本地数据库更新后的`真Tweet`状态的转化的UI需优化，目前会转换时会闪一下
+ 由于云的问题，目前更新`boxes`列表大概率会失败，需要跟踪处理
+ 性能优化，目前页面存在一些重复渲染的问题
+ 对于纯文本Tweets的发送与显示的支持