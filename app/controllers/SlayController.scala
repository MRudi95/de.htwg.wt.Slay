package controllers

import javax.inject._
import play.api.mvc._
import de.htwg.se.slay.Slay
import de.htwg.se.slay.controller.controllerComponent._
import de.htwg.se.slay.model.fileIOComponent.fileIoJSONimpl.FileIO
import de.htwg.se.slay.util.Observer
import play.api.libs.json.Json
import play.api.libs.streams.ActorFlow
import akka.actor._
import akka.stream.Materializer

@Singleton
class SlayController @Inject()(cc: ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) with Observer {
  val gameController = Slay.controller
  gameController.add(this)
  var message :String = _
  var updateEvent: Event = _
  val jsonIO = new FileIO

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
    Slay.tui.processInput("buy " + coord)
    //Ok(slayAsText)
    jsonUpdate
  }

  def mov(coord1: String, coord2: String) = Action{
    Slay.tui.processInput("mov " + coord1 + " " + coord2)
    //Ok(slayAsText)
    jsonUpdate
  }

  def cmb(coord1: String, coord2: String) = Action{
    Slay.tui.processInput("cmb " + coord1 + " " + coord2)
    //Ok(slayAsText)
    jsonUpdate
  }

  def plc(coord: String) = Action {
    Slay.tui.processInput("plc " + coord)
    //Ok(slayAsText)
    jsonUpdate
  }

  def bal(coord: String) = Action {
    Slay.tui.processInput("bal " + coord)
    jsonUpdate
  }

  def undo() = Action {
    Slay.tui.processInput("undo")
    Ok(slayAsText)
    //brauch noch javascript wie die anderen
  }

  def redo() = Action {
    Slay.tui.processInput("redo")
    Ok(slayAsText)
    //brauch noch javascript wie die anderen
  }

  def end() = Action {
    Slay.tui.processInput("end")
    Ok(slayAsText)
  }

  def surrender() = Action {
    Slay.tui.processInput("ff20")
    Ok(slayAsText)
  }

  def command(command: String) = Action{
    Slay.tui.processInput(command)
    Ok(slayAsText)
  }


  def getPlayerturn() = {
    gameController.players(gameController.state).name
  }

  def socket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connect received")
      MyWebSocketActor.props(out)
    }
  }

  object MyWebSocketActor {
    def props(out: ActorRef) = {
      println("Object created")
      Props(new MyWebSocketActor(out))
    }
  }

  class MyWebSocketActor(out: ActorRef) extends Actor {
    println("Class created")
    def receive = {
      case msg: String =>
        out ! ("I received your message: " + msg)
        println("Received message "+ msg)
    }
  }


  override def update(e: Event): Boolean = {
    updateEvent = e
    e match{
      case _: MoneyErrorEvent =>
        message = "Not enough Money!"; true
      case b: BalanceEvent =>
        message = "Balance: " + b.bal + " Income: " + b.inc + " ArmyCost: " + b.cost; true
      case _: OwnerErrorEvent =>
        message = "You are not the Owner of this!"; true
      case _: GamePieceErrorEvent =>
        message = "There already is a GamePiece there!"; true
      case _: CombineErrorEvent =>
        message = "Can't combine those Units!"; true
      case m: MoveErrorEvent =>
        message = "Can't move there! " + m.reason; true
      case _: MovableErrorEvent =>
        message = "This Unit is not movable!"; true
      case _: MovedErrorEvent =>
        message = "This Unit has already moved this turn!"; true
      case _: UndoErrorEvent =>
        message = "Nothing to undo!"; true
      case _: RedoErrorEvent =>
        message = "Nothing to redo!"; true
      case _ => false
    }
  }
}


