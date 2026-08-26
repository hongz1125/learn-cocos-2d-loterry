import {
  _decorator,
  Component,
  Node,
  input,
  Input,
  Prefab,
  instantiate,
  tween,
  Vec3,
  Collider2D,
  Contact2DType,
  Animation,
  Label,
  director,
  AudioClip,
  AudioSource,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("player")
export class player extends Component {
  @property(Node) // 目标节点
  Target_Node: Node = null;

  @property(Prefab) // 小刀预制节点
  Knife_Prefab: Prefab = null;

  @property(Node) // 预制父节点
  Knife_Parent: Node = null;

  @property(Node) // tips节点
  Tips_Node: Node = null;

  @property(Label) // tips文本节点
  Tips_Label: Label = null;

  @property(Label) // 文字总数节点
  Total_All_Label: Label = null;

  @property(Label) // 当前数量节点
  Total_Now_Label: Label = null;

  @property(Animation) // 重新开始按钮动画组件
  Button_Animation: Animation = null;

  @property(AudioClip) // 成功
  Win_Audio: AudioClip = null;

  @property(AudioClip) // 失败
  Lose_Audio: AudioClip = null;

  Angle = 0;
  Angle_Speed = 150;
  Move = true; // 是否可继续移动
  Total_All = 12; // 胜利条件
  Total_Now = 0; // 单前几个
  Total_Btn = true; // 是否可 更新开关

  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_START, this.Touch_Start, this);
  }
  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_START, this.Touch_Start, this);
  }

  knifeToTarget(Knife_Node) {
    const worldPos = Knife_Node.getWorldPosition();
    Knife_Node.setParent(this.Target_Node);
    Knife_Node.setWorldPosition(worldPos);
    Knife_Node.angle = -this.Angle;
    this.upTotal();
  }
  upTotal() {
    if (!this.Total_Btn) return;
    this.Total_Now++;
    this.Total_Now_Label.string = `当前：${this.Total_Now} 把`;
    this.audioWinPlay()
    if (this.Total_Now >= this.Total_All) {
      this.tipsChange();
    }
  }

  beginContact() {
    this.Total_Btn = false;
    this.tipsChange();
  }

  tipsChange() {
    this.Button_Animation.play("d1");
    this.Move = false; // 关闭旋转
    input.off(Input.EventType.TOUCH_START, this.Touch_Start, this); // 关闭发射
    this.Tips_Node.active = true;
    if (this.Total_Now >= this.Total_All) {
      console.log("成功了");
      this.Tips_Label.string = "成功了！";
      
    } else {
      console.log("碰撞了");
      this.Tips_Label.string = "失败了！";
      this.audioLosePlay()
    }
  }
  audioWinPlay() {
    const audio = this.node.getComponent(AudioSource);
    audio.clip = this.Win_Audio;
    audio.play();
  }
  audioLosePlay() {
    const audio = this.node.getComponent(AudioSource);
    audio.clip = this.Lose_Audio;
    audio.play();
  }
  Restart_Game() {
    this.Button_Animation.stop();
    director.loadScene("c1");
  }

  Touch_Start() {
    const Knife_Node = instantiate(this.Knife_Prefab);
    Knife_Node.setParent(this.Knife_Parent);
    Knife_Node.getComponent(Collider2D).on(
      Contact2DType.BEGIN_CONTACT,
      this.beginContact,
      this,
    );

    tween(Knife_Node)
      .to(0.1, { position: new Vec3(0, 250, 0) })
      .call(() => {
        this.knifeToTarget(Knife_Node);
        Knife_Node.getComponent(Collider2D).off(
          Contact2DType.BEGIN_CONTACT,
          this.beginContact,
          this,
        );
      })
      .start();
  }

  start() {
    this.Total_All_Label.string = `目标：射入 ${this.Total_All} 把宝剑`;
    this.Total_Now_Label.string = `当前：${this.Total_Now} 把`;
  }

  update(deltaTime: number) {
    if (!this.Move) return;
    if (this.Angle >= 360) {
      this.Angle -= 360;
    }
    this.Angle += this.Angle_Speed * deltaTime;
    this.Target_Node.angle = this.Angle;
  }
}
