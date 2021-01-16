package controllers

import javax.inject._
import play.api.mvc._
import de.htwg.se.slay.{Slay, SlayModule}
import de.htwg.se.slay.controller.controllerComponent._
import de.htwg.se.slay.model.fileIOComponent.fileIoJSONimpl.FileIO
import de.htwg.se.slay.util.Observer
import play.api.libs.json.{JsString, JsValue, Json}
import play.api.libs.streams.ActorFlow
import akka.actor._
import akka.stream.Materializer
import com.google.inject.{Guice, Injector}
import de.htwg.se.slay.aview.TextUI

@Singleton
class SlayController @Inject()(cc: ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc){
  val injector: Injector = Guice.createInjector(new SlayModule)
  val (gameController, tui) = newGameInstance()

  var message :String = _
  var updateEvent: Event = _
  val jsonIO = new FileIO

  def newGameInstance():(ControllerInterface, TextUI) = {
    val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])
    val tui = new TextUI(controller)

    controller.createGrid("Map1")
    controller.nextturn()

    (controller, tui)
  }

  def slayAsText = {
    views.html.slay(this, message)
  }

  def checksuccess: Boolean = {
    updateEvent match {
      case _: SuccessEvent => true
      case _ => false
    }
  }

  def jsonUpdate = {
    if (checksuccess)
      Ok(jsonIO.gridToJson(gameController.grid, gameController.players))
    else
      Ok(Json.obj(
        "message" -> message,
      ))
  }

  def about = Action {
    Ok(views.html.about())
  }

  def slay = Action {
    Ok(slayAsText)
  }

  //commands
  def buy(coord: String) = Action {
    tui.processInput("buy " + coord)
    jsonUpdate
  }

  def mov(coord1: String, coord2: String) = Action{
    tui.processInput("mov " + coord1 + " " + coord2)
    jsonUpdate
  }

  def cmb(coord1: String, coord2: String) = Action{
    tui.processInput("cmb " + coord1 + " " + coord2)
    jsonUpdate
  }

  def plc(coord: String) = Action {
    tui.processInput("plc " + coord)
    jsonUpdate
  }

  def bal(coord: String) = Action {
    tui.processInput("bal " + coord)
    jsonUpdate
  }

  def undo() = Action {
    tui.processInput("undo")
    Ok(slayAsText)
    //brauch noch javascript wie die anderen
  }

  def redo() = Action {
    tui.processInput("redo")
    Ok(slayAsText)
    //brauch noch javascript wie die anderen
  }

  def end() = Action {
    tui.processInput("end")
    Ok(Json.obj("player" -> Json.obj(
        "playername" -> getPlayerturn(),
        "playercolor" -> getPlayercolor(),
      )
    ))
  }

  def surrender() = Action {
    tui.processInput("ff20")
    Ok(slayAsText)
  }

  def command(command: String) = Action{
    tui.processInput(command)
    Ok(slayAsText)
  }

  def getJson() = Action{
    var json = jsonIO.gridToJson(gameController.grid, gameController.players)
    json = json.+(("player", Json.obj(
      "playername" -> getPlayerturn(),
      "playercolor" -> getPlayercolor(),
    )))
    Ok(json)
  }

  def getPlayerturn() = {
    gameController.players(gameController.state).name
  }
  def getPlayercolor()={
    gameController.state match {
      case 1 => "yellow"
      case 2 => "green"
      case _ => ""
    }
  }


  //websocket
  def socket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      MyWebSocketActor.props(out)
    }
  }

  object MyWebSocketActor {
    def props(out: ActorRef) = {
      Props(new MyWebSocketActor(out))
    }
  }

  class MyWebSocketActor(out: ActorRef) extends Actor with Observer {
    gameController.add(this)

    def receive = {
      case msg: String =>
        out ! ("I received your message: " + msg)
    }

    val jsonIO = new FileIO
    override def update(e: Event): Boolean = {
      updateEvent = e
      e match{
        case _: SuccessEvent => out ! jsonIO.gridToJson(gameController.grid, gameController.players).toString(); true
        case _: MoneyErrorEvent => out ! Json.obj( "message" -> "Not enough Money!").toString(); true
        case b: BalanceEvent =>
          val msg = "Balance: " + b.bal + " Income: " + b.inc + " ArmyCost: " + b.cost
          out ! Json.obj( "message" -> msg).toString(); true
        case _: OwnerErrorEvent => out ! Json.obj( "message" -> "You are not the Owner of this!").toString(); true
        case _: GamePieceErrorEvent => out ! Json.obj( "message" -> "There already is a GamePiece there!").toString(); true
        case _: CombineErrorEvent => out ! Json.obj( "message" -> "Can't combine those Units!").toString(); true
        case m: MoveErrorEvent =>
          val msg = "Can't move there! " + m.reason
          out ! Json.obj( "message" -> msg).toString(); true
        case _: MovableErrorEvent => out ! Json.obj( "message" -> "This Unit is not movable!").toString(); true
        case _: MovedErrorEvent => out ! Json.obj( "message" -> "This Unit has already moved this turn!").toString(); true
        case _: UndoErrorEvent => out ! Json.obj( "message" -> "Nothing to undo!").toString(); true
        case _: RedoErrorEvent => out ! Json.obj( "message" -> "Nothing to redo!").toString(); true
        case _: PlayerEvent =>
          out ! Json.obj("player" -> Json.obj(
          "playername" -> getPlayerturn(),
          "playercolor" -> getPlayercolor(),
          )).toString(); true
        case _ => false
      }
    }
  }
}


